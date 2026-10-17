import { NextResponse } from "next/server";
import { z } from "zod";
import { PAID_PLANS, PLANS, razorpayPlanId } from "@/lib/pricing";
import { rzp } from "@/lib/razorpay";
import { rateLimit } from "@/lib/ratelimit";
import { badRequest, fail, tooMany, unauthorized } from "@/lib/security";
import { adminClient, requireUser } from "@/lib/supabase/server";
import { parseJson } from "@/lib/validate";

const TRIAL_DAYS = 7;
const Body = z.object({ plan: z.enum(PAID_PLANS as [string, ...string[]]) });

/** Checkout always creates a subscription (UPI Autopay mandate). The first debit is on day 8. */
export async function POST(request: Request) {
  const { user } = await requireUser();
  if (!user) return unauthorized();
  if (!(await rateLimit("api", user.id)).ok) return tooMany();
  const body = await parseJson(request, Body);
  if (!body) return badRequest("Pick a plan.");
  const plan = body.plan as keyof typeof PLANS;
  // The price is whatever the Razorpay plan says; the browser only picks which plan
  const planId = razorpayPlanId(plan);
  if (!planId) return NextResponse.json({ error: `${PLANS[plan].name} isn't available yet. Pick another plan.` }, { status: 503 });
  const admin = adminClient();

  const { data: existing } = await admin.from("subscriptions").select("razorpay_subscription_id, status").eq("user_id", user.id).maybeSingle();
  if (existing?.status && ["active", "authenticated", "pending"].includes(existing.status)) {
    return NextResponse.json({ error: "You already have a paid plan. See your next debit below." }, { status: 400 });
  }

  const startAt = Math.floor(Date.now() / 1000) + TRIAL_DAYS * 86_400;
  try {
    const sub = await rzp<{ id: string }>("/subscriptions", {
      plan_id: planId,
      total_count: PLANS[plan].totalCount, // ~5 years; cancel anytime
      start_at: startAt,
      customer_notify: 1,
      notes: { user_id: user.id, plan },
    });
    await admin.from("subscriptions").upsert({
      user_id: user.id,
      razorpay_subscription_id: sub.id,
      status: "created",
      plan_code: plan,
      trial_end: new Date(startAt * 1000).toISOString(),
    });
    return NextResponse.json({ subscriptionId: sub.id, keyId: process.env.RAZORPAY_KEY_ID, email: user.email, plan });
  } catch (e) {
    return fail("razorpay.subscribe", e, "Couldn't start checkout. Try again in a minute.", 502);
  }
}
