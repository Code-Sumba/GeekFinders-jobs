/**
 * Plans — the single source for names, prices and billing periods.
 * All paid plans unlock the same features (users.plan = "pro"); they differ only in how often Autopay debits.
 * The amount actually charged is set on the Razorpay plan (env RAZORPAY_PLAN_ID_*); the client only ever sends a plan code.
 */
export type PaidPlan = "hustle" | "season" | "yearpass";
export const PAID_PLANS: PaidPlan[] = ["hustle", "season", "yearpass"];

export const FREE_PLAN = { name: "Fresher", price: 0 } as const;

type PlanInfo = {
  name: string;
  /** Rupees per debit */
  price: number;
  /** "every 15 days" */
  every: string;
  /** Approximate length of one billing period, for fallbacks when Razorpay doesn't send current_end */
  days: number;
  /** Debits a year, for honest comparisons */
  perYear: number;
  /** Razorpay subscription total_count (~5 years) */
  totalCount: number;
  note: string;
};

export const PLANS: Record<PaidPlan, PlanInfo> = {
  hustle: { name: "Hustle", price: 10, every: "every 15 days", days: 15, perYear: 24, totalCount: 120, note: "About ₹20 a month" },
  season: { name: "Season", price: 59, every: "every 3 months", days: 91, perYear: 4, totalCount: 20, note: "4 debits a year instead of 24" },
  yearpass: { name: "Year Pass", price: 199, every: "a year", days: 365, perYear: 1, totalCount: 5, note: "About ₹17 a month · save 17%" },
};

export const DEFAULT_PLAN: PaidPlan = "season";
export const isPaidPlan = (v: unknown): v is PaidPlan => typeof v === "string" && (PAID_PLANS as string[]).includes(v);

/** Razorpay plan id for a plan code. Hustle falls back to the original RAZORPAY_PLAN_ID. */
export function razorpayPlanId(plan: PaidPlan): string | undefined {
  const env = { hustle: process.env.RAZORPAY_PLAN_ID_HUSTLE ?? process.env.RAZORPAY_PLAN_ID, season: process.env.RAZORPAY_PLAN_ID_SEASON, yearpass: process.env.RAZORPAY_PLAN_ID_YEARPASS };
  return env[plan] || undefined;
}

/** Reverse lookup used by the webhook: Razorpay's plan_id is the authority on what was bought. */
export function planFromRazorpayId(planId: string | undefined | null): PaidPlan | null {
  if (!planId) return null;
  return PAID_PLANS.find((p) => razorpayPlanId(p) === planId) ?? null;
}

/** "Season" for a paid user with a known plan, "Fresher" for free users. */
export function planName(plan: "free" | "pro", code?: string | null) {
  if (plan === "free") return FREE_PLAN.name;
  return isPaidPlan(code) ? PLANS[code].name : "Paid plan";
}

/** Short line for upsells: "Paid plans from ₹10 every 15 days" */
export const FROM_PRICE = `from ₹${PLANS.hustle.price} ${PLANS.hustle.every}`;
