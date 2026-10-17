import { NextResponse } from "next/server";
import { AiBudgetError, generateJSON, untrusted } from "@/lib/ai";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { badRequest, fail, oneLine, tooMany } from "@/lib/security";
import { verifyTurnstile } from "@/lib/turnstile";
import { PublicToolBody, parseJson } from "@/lib/validate";

export const maxDuration = 45;

/** Public free tool: CAPTCHA + per-IP rate limit + global AI cap protect the free AI quota. */
export async function POST(request: Request) {
  const body = await parseJson(request, PublicToolBody);
  if (!body) return badRequest("Paste your resume and the job description.");
  const rl = await rateLimit("public");
  if (!rl.ok) return tooMany(rl.retryAfter);
  if (!(await verifyTurnstile(body.turnstile, await clientIp()))) return badRequest("Please complete the check and try again.");

  try {
    const out = await generateJSON<{ subject: string; email: string; linkedin_note: string }>(`Write outreach for a fresher applying to the job below.
Return JSON: {"subject":string,"email":string,"linkedin_note":string}
- subject: under 80 characters.
- email: under 150 words, polite, specific, addressed to the Hiring Team, mention 2 relevant skills or projects from the resume, end by asking them to consider the attached resume. Sign with the student's name if present.
- linkedin_note: under 300 characters.
- Use only facts from the resume. Plain Indian English. No exclamation marks.

${untrusted("job", body.job, 6000)}

${untrusted("resume", body.resume, 8000)}`);
    return NextResponse.json({
      subject: oneLine(String(out.subject ?? ""), 120),
      email: String(out.email ?? "").slice(0, 2000),
      linkedin_note: String(out.linkedin_note ?? "").slice(0, 300),
    });
  } catch (e) {
    if (e instanceof AiBudgetError) return fail("tools.hr.budget", e, "The free tool is busy today. Try again tomorrow.", 503);
    return fail("tools.hr", e, "Couldn't write the email this time. Try again in a minute.", 502);
  }
}
