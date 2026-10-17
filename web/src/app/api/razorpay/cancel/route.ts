import { NextResponse } from "next/server";
import { adminClient, requireUser } from "@/lib/supabase/server";
import { rzp } from "@/lib/razorpay";
import { fail, unauthorized } from "@/lib/security";

/** Cancel at cycle end: paid features stay until current_period_end (webhook handles the downgrade). */
export async function POST() {
  const { user } = await requireUser();
  if (!user) return unauthorized();
  const admin = adminClient();
  const { data: sub } = await admin.from("subscriptions").select("razorpay_subscription_id").eq("user_id", user.id).maybeSingle();
  if (!sub?.razorpay_subscription_id) return NextResponse.json({ error: "No subscription" }, { status: 404 });
  try {
    await rzp(`/subscriptions/${sub.razorpay_subscription_id}/cancel`, { cancel_at_cycle_end: 1 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail("razorpay.cancel", e, "Couldn't cancel here. Cancel the mandate from your UPI app instead.", 502);
  }
}
