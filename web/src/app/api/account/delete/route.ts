import { NextResponse } from "next/server";
import { rzp } from "@/lib/razorpay";
import { rateLimit } from "@/lib/ratelimit";
import { fail, tooMany, unauthorized } from "@/lib/security";
import { adminClient, requireUser } from "@/lib/supabase/server";

/**
 * DPDP: delete profile, resumes, matches and outreach logs (cascades from auth.users).
 * Cancels any UPI Autopay subscription first so a deleted account is never charged again.
 */
export async function POST() {
  const { supabase, user } = await requireUser();
  if (!user) return unauthorized();
  if (!(await rateLimit("api", user.id)).ok) return tooMany();
  const admin = adminClient();

  const { data: sub } = await admin.from("subscriptions").select("razorpay_subscription_id, status").eq("user_id", user.id).maybeSingle();
  if (sub?.razorpay_subscription_id && !["cancelled", "completed", "expired"].includes(sub.status ?? "")) {
    try {
      // Immediate cancel (not at cycle end): the account and its access are going away now
      await rzp(`/subscriptions/${sub.razorpay_subscription_id}/cancel`, { cancel_at_cycle_end: 0 });
    } catch (e) {
      return fail("account.delete.cancel", e, "We couldn't cancel your Autopay, so your account wasn't deleted. Cancel the mandate in your UPI app, then try again.", 502);
    }
  }

  const { data: files } = await admin.storage.from("resumes").list(user.id);
  if (files?.length) await admin.storage.from("resumes").remove(files.map((f) => `${user.id}/${f.name}`));

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return fail("account.delete", error, "Couldn't delete your account. Try again or email us.");
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
