import { beforeEach, describe, expect, it, vi } from "vitest";
import { periodStart } from "@/lib/plan";

const DAY = 86_400_000;

describe("15-day quota windows on every paid plan", () => {
  const now = Date.parse("2026-10-17T00:00:00Z");
  it("Hustle: the window is the whole 15-day period", () => {
    expect(periodStart("pro", new Date(now + 10 * DAY).toISOString(), now)).toBe("2026-10-12");
  });
  it("Season: a fresh window every 15 days inside 3 months", () => {
    const end = new Date(now + 80 * DAY).toISOString(); // period ends 2027-01-05
    const a = periodStart("pro", end, now);
    const b = periodStart("pro", end, now + 16 * DAY);
    expect(a).not.toBe(b);
    expect(Date.parse(b) - Date.parse(a)).toBe(15 * DAY);
    expect(Date.parse(a)).toBeLessThanOrEqual(now); // window contains today
    expect(Date.parse(a) + 15 * DAY).toBeGreaterThan(now);
  });
  it("Free: one lifetime window", () => {
    expect(periodStart("free", null, now)).toBe("2000-01-01");
  });
});

describe("plan lookups", () => {
  beforeEach(() => {
    process.env.RAZORPAY_PLAN_ID = "plan_hustle";
    process.env.RAZORPAY_PLAN_ID_SEASON = "plan_season";
    process.env.RAZORPAY_PLAN_ID_YEARPASS = "plan_year";
    delete process.env.RAZORPAY_PLAN_ID_HUSTLE;
  });
  it("maps Razorpay plan ids back to plan codes", async () => {
    const { planFromRazorpayId, razorpayPlanId } = await import("@/lib/pricing");
    expect(razorpayPlanId("hustle")).toBe("plan_hustle"); // falls back to the original env var
    expect(planFromRazorpayId("plan_year")).toBe("yearpass");
    expect(planFromRazorpayId("plan_unknown")).toBeNull();
  });
});

describe("checkout", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.RAZORPAY_PLAN_ID_SEASON = "plan_season";
    delete process.env.RAZORPAY_PLAN_ID_YEARPASS;
  });
  function mocks() {
    const rzp = vi.fn(async () => ({ id: "sub_1" }));
    const upsert = vi.fn(async () => ({}));
    const q = { select: () => q, eq: () => q, maybeSingle: async () => ({ data: null }), upsert };
    vi.doMock("@/lib/supabase/server", () => ({ requireUser: async () => ({ user: { id: "u1", email: "a@b.c" } }), adminClient: () => ({ from: () => q }) }));
    vi.doMock("@/lib/ratelimit", () => ({ rateLimit: async () => ({ ok: true }) }));
    vi.doMock("@/lib/razorpay", () => ({ rzp }));
    return { rzp, upsert };
  }
  const post = (plan: unknown) => new Request("http://localhost:3000/api/razorpay/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });

  it("uses the server's Razorpay plan id for the chosen plan", async () => {
    const m = mocks();
    const { POST } = await import("@/app/api/razorpay/subscribe/route");
    expect((await POST(post("season"))).status).toBe(200);
    expect((m.rzp.mock.calls[0] as unknown as [string, { plan_id: string }])[1].plan_id).toBe("plan_season");
    expect((m.upsert.mock.calls[0] as unknown as [{ plan_code: string }])[0].plan_code).toBe("season");
  });

  it("rejects made-up plans and plans not set up yet", async () => {
    const m = mocks();
    const { POST } = await import("@/app/api/razorpay/subscribe/route");
    expect((await POST(post("free-forever"))).status).toBe(400);
    expect((await POST(post({ plan_id: "plan_cheap" }))).status).toBe(400);
    expect((await POST(post("yearpass"))).status).toBe(503);
    expect(m.rzp).not.toHaveBeenCalled();
  });
});
