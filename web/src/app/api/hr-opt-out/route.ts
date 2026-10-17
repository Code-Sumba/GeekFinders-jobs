import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { badRequest, tooMany } from "@/lib/security";
import { adminClient } from "@/lib/supabase/admin";
import { verifyTurnstile } from "@/lib/turnstile";
import { parseJson } from "@/lib/validate";

const Body = z.object({ email: z.string().trim().toLowerCase().email().max(254), turnstile: z.string().max(2048).optional() });

/** Recruiters opt out: the address is flagged do_not_contact and hidden from every student (plan: honour do-not-contact). */
export async function POST(request: Request) {
  const body = await parseJson(request, Body);
  if (!body) return badRequest("Enter a valid work email.");
  if (!(await rateLimit("public")).ok) return tooMany();
  if (!(await verifyTurnstile(body.turnstile, await clientIp()))) return badRequest("Please complete the check and try again.");

  const admin = adminClient();
  const domain = body.email.split("@")[1];
  const now = new Date().toISOString();
  await admin.from("company_contacts").update({ do_not_contact: true, opted_out_at: now }).ilike("email", body.email);
  await admin
    .from("company_contacts")
    .upsert({ company_domain: domain, email: body.email, source: "hr opt-out", do_not_contact: true, opted_out_at: now }, { onConflict: "company_domain,email" });
  // Same response whether or not we had the address (no enumeration)
  return NextResponse.json({ ok: true });
}
