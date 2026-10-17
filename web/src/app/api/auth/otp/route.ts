import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { badRequest, log, safeNext, tooMany } from "@/lib/security";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { parseJson } from "@/lib/validate";

const Body = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  turnstile: z.string().max(2048).optional(),
  next: z.string().max(200).optional(),
});

/** Send an email OTP. Rate limited per IP and per email, CAPTCHA-checked, same response for known and unknown emails. */
export async function POST(request: Request) {
  const body = await parseJson(request, Body);
  if (!body) return badRequest("Enter a valid email address.");
  const ip = await clientIp();
  const [byIp, byEmail] = await Promise.all([rateLimit("auth"), rateLimit("auth", `email:${body.email}`)]);
  if (!byIp.ok || !byEmail.ok) return tooMany(Math.max(byIp.retryAfter, byEmail.retryAfter));
  // With Supabase bot protection on (Auth → Bot and abuse protection → Turnstile), Supabase itself checks the token,
  // which also covers anyone calling Supabase's public OTP endpoint directly. Tokens are single-use, so don't verify twice.
  const supabaseChecksCaptcha = process.env.SUPABASE_AUTH_CAPTCHA === "1";
  if (!supabaseChecksCaptcha && !(await verifyTurnstile(body.turnstile, ip))) return badRequest("Please complete the check above and try again.");

  const supabase = await createClient();
  const origin = new URL(request.url).origin;
  const { error } = await supabase.auth.signInWithOtp({
    email: body.email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext(body.next, "/onboarding"))}&consent=1`,
      ...(supabaseChecksCaptcha ? { captchaToken: body.turnstile } : {}),
    },
  });
  if (error) {
    log.warn("auth.otp", error); // never reveal whether the email exists
    if (/captcha/i.test(error.message)) return badRequest("Please complete the check above and try again.");
  }
  return NextResponse.json({ ok: true, message: "Check your inbox for a 6-digit code." });
}
