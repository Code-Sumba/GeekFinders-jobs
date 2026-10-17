import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/ratelimit";
import { badRequest, tooMany, unauthorized } from "@/lib/security";
import { adminClient, requireUser } from "@/lib/supabase/server";
import { OutreachSentBody, parseJson } from "@/lib/validate";

const DAILY_EMAIL_CAP = 15;

/** Log outreach, schedule a 5-day follow-up, and auto-add to the tracker as "applied". */
export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return unauthorized();
  const body = await parseJson(request, OutreachSentBody);
  if (!body) return badRequest();
  if (!(await rateLimit("api", user.id)).ok) return tooMany();

  const admin = adminClient();
  const now = new Date();
  if (body.channel === "email") {
    // Plan: max 15 HR emails per student per day (protects their Gmail from spam flags)
    const since = new Date(now.getTime() - 24 * 3_600_000).toISOString();
    const { count } = await admin.from("outreach").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("channel", "email").gte("sent_at", since);
    if ((count ?? 0) >= DAILY_EMAIL_CAP) {
      return NextResponse.json({ error: "You've emailed 15 HRs today. Send more tomorrow so your Gmail stays out of spam." }, { status: 429 });
    }
  }

  await admin.from("outreach").insert({
    user_id: user.id,
    job_id: body.jobId,
    channel: body.channel,
    contact_email: body.contactEmail ?? null,
    status: "sent",
    sent_at: now.toISOString(),
    follow_up_at: body.channel === "email" ? new Date(now.getTime() + 5 * 86_400_000).toISOString() : null,
  });
  // Add as "applied", or move up from "saved" — never pull an interview/offer back down
  const row = { user_id: user.id, job_id: body.jobId, stage: "applied", updated_at: now.toISOString() };
  await supabase.from("applications").upsert(row, { onConflict: "user_id,job_id", ignoreDuplicates: true });
  await supabase.from("applications").update(row).eq("user_id", user.id).eq("job_id", body.jobId).eq("stage", "saved");
  return NextResponse.json({ ok: true });
}
