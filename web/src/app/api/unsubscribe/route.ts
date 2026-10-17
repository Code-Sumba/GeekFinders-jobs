import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/ratelimit";
import { badRequest, tooMany } from "@/lib/security";
import { adminClient } from "@/lib/supabase/admin";
import { verifyUnsubscribe } from "@/lib/unsubscribe";

const Q = z.object({ u: z.string().uuid(), t: z.string().min(16).max(64) });

/**
 * Stop email digests. Works without login: from the /unsubscribe page, or as an RFC 8058
 * one-click POST sent by Gmail/Yahoo from the List-Unsubscribe header.
 */
export async function POST(request: Request) {
  if (!(await rateLimit("public")).ok) return tooMany();
  const url = new URL(request.url);
  const form = await request.formData().catch(() => null);
  const parsed = Q.safeParse({ u: url.searchParams.get("u") ?? form?.get("u"), t: url.searchParams.get("t") ?? form?.get("t") });
  if (!parsed.success || !verifyUnsubscribe(parsed.data.u, parsed.data.t)) return badRequest("This unsubscribe link isn't valid.");

  const admin = adminClient();
  const { data } = await admin.from("alert_settings").select("channels").eq("user_id", parsed.data.u).maybeSingle();
  if (data) await admin.from("alert_settings").update({ channels: (data.channels as string[]).filter((c) => c !== "email") }).eq("user_id", parsed.data.u);

  // Browser form posts land back on the page; mail providers just need a 2xx
  if (form?.get("from") === "page") return NextResponse.redirect(new URL("/unsubscribe?done=1", url.origin), { status: 303 });
  return NextResponse.json({ ok: true });
}
