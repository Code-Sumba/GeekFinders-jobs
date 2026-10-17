import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const adminClient = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({ adminClient }));

beforeEach(() => {
  process.env.RAZORPAY_WEBHOOK_SECRET = "whsec_test";
  process.env.TELEGRAM_WEBHOOK_SECRET = "tg_secret_test";
  adminClient.mockReset();
});
afterEach(() => vi.resetModules());

describe("Razorpay webhook signature", () => {
  it("verifyWebhook accepts the right HMAC and rejects anything else", async () => {
    const { verifyWebhook } = await import("@/lib/razorpay");
    const body = JSON.stringify({ event: "subscription.activated" });
    const sig = createHmac("sha256", "whsec_test").update(body).digest("hex");
    expect(verifyWebhook(body, sig)).toBe(true);
    expect(verifyWebhook(body, "0".repeat(64))).toBe(false);
    expect(verifyWebhook(body + " ", sig)).toBe(false);
    expect(verifyWebhook(body, null)).toBe(false);
  });

  it("fails closed when the secret is not configured", async () => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    const { verifyWebhook } = await import("@/lib/razorpay");
    expect(verifyWebhook("{}", "abc")).toBe(false);
  });

  it("unsigned webhook → 400 and no database access (no plan change)", async () => {
    const { POST } = await import("@/app/api/razorpay/webhook/route");
    const res = await POST(new Request("http://x/api/razorpay/webhook", { method: "POST", body: JSON.stringify({ event: "subscription.activated", payload: { subscription: { entity: { id: "sub_1", status: "active" } } } }) }));
    expect(res.status).toBe(400);
    expect(adminClient).not.toHaveBeenCalled();
  });
});

describe("Telegram webhook spoofing", () => {
  it("rejects updates without the secret token header", async () => {
    const { POST } = await import("@/app/api/telegram/webhook/route");
    const res = await POST(new Request("http://x/api/telegram/webhook", { method: "POST", body: JSON.stringify({ message: { text: "/start abc", chat: { id: 1 } } }) }));
    expect(res.status).toBe(401);
    expect(adminClient).not.toHaveBeenCalled();
  });

  it("rejects a wrong secret token", async () => {
    const { POST } = await import("@/app/api/telegram/webhook/route");
    const res = await POST(new Request("http://x/api/telegram/webhook", { method: "POST", headers: { "x-telegram-bot-api-secret-token": "nope" }, body: "{}" }));
    expect(res.status).toBe(401);
  });
});
