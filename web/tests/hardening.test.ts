import { beforeEach, describe, expect, it, vi } from "vitest";

describe("signed unsubscribe links", () => {
  beforeEach(() => { process.env.UNSUBSCRIBE_SECRET = "test-secret"; });

  it("accepts the right token and rejects tampering", async () => {
    const { unsubscribeToken, verifyUnsubscribe, unsubscribeUrl } = await import("@/lib/unsubscribe");
    const id = "3f1c2b9e-8a4d-4c2b-9f1e-2a3b4c5d6e7f";
    const t = unsubscribeToken(id);
    expect(verifyUnsubscribe(id, t)).toBe(true);
    expect(verifyUnsubscribe("00000000-0000-4000-8000-000000000000", t)).toBe(false); // someone else's id
    expect(verifyUnsubscribe(id, t.slice(0, -1) + (t.endsWith("A") ? "B" : "A"))).toBe(false);
    expect(unsubscribeUrl("https://geeksfinder.in", id)).toContain(`/unsubscribe?u=${id}&t=${t}`);
  });

  it("fails closed with no secret", async () => {
    delete process.env.UNSUBSCRIBE_SECRET;
    const prev = process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const { verifyUnsubscribe } = await import("@/lib/unsubscribe");
    expect(verifyUnsubscribe("x", "y")).toBe(false);
    process.env.SUPABASE_SERVICE_ROLE_KEY = prev;
  });
});

describe("account deletion never leaves Autopay running", () => {
  it("does not delete the account if the subscription can't be cancelled", async () => {
    const deleteUser = vi.fn();
    const q = { select: () => q, eq: () => q, maybeSingle: async () => ({ data: { razorpay_subscription_id: "sub_1", status: "active" } }) };
    vi.doMock("@/lib/supabase/server", () => ({
      requireUser: async () => ({ user: { id: "u1" }, supabase: { auth: { signOut: async () => ({}) } } }),
      adminClient: () => ({ from: () => q, auth: { admin: { deleteUser } }, storage: { from: () => ({ list: async () => ({ data: [] }) }) } }),
    }));
    vi.doMock("@/lib/ratelimit", () => ({ rateLimit: async () => ({ ok: true, retryAfter: 0 }) }));
    vi.doMock("@/lib/razorpay", () => ({ rzp: async () => { throw new Error("razorpay down"); } }));
    const { POST } = await import("@/app/api/account/delete/route");
    const res = await POST();
    expect(res.status).toBe(502);
    expect(deleteUser).not.toHaveBeenCalled();
  });
});

describe("tailoring never moves text onto the wrong project", () => {
  const base = {
    name: "Priya", email: "", phone: "", summary: "", skills: ["Python", "SQL"], education: [], experience_level: "fresher" as const,
    experience: [{ company: "Local Startup", role: "Web Development Intern", duration: "", bullets: ["Fixed UI bugs in a React dashboard and wrote reusable components."] }],
    projects: [
      { name: "Campus Canteen App", tech: [], description: "Built a web app for students to order food from the college canteen. Implemented login, menu, cart and order status with a REST API in Node.js and a MySQL database." },
      { name: "Expense Tracker", tech: [], description: "Made a Flask app to record daily expenses and show monthly charts. Wrote SQL queries for category-wise totals." },
    ],
  };

  it("matches reordered projects by name", async () => {
    const { enforceNoNewSkills } = await import("@/lib/resume");
    const out = enforceNoNewSkills(base, {
      ...base,
      projects: [
        { name: "Expense Tracker", tech: [], description: "Developed a Python and Flask application to record daily expenses and generate monthly charts with SQL queries for category-wise totals." },
        { name: "Campus Canteen App", tech: [], description: "Engineered a web app for campus canteen food ordering with login, menu, cart and order status using a Node.js REST API and MySQL database." },
      ],
    });
    expect(out.projects[0].name).toBe("Campus Canteen App");
    expect(out.projects[0].description).toContain("canteen");
    expect(out.projects[1].description).toContain("expenses");
  });

  it("rejects a swapped description even at the same position", async () => {
    const { enforceNoNewSkills } = await import("@/lib/resume");
    const out = enforceNoNewSkills(base, {
      ...base,
      projects: [
        { ...base.projects[0], description: "Developed a Python and Flask application to record daily expenses and generate monthly visualizations, writing SQL queries to calculate category-wise totals." },
        base.projects[1],
      ],
    });
    expect(out.projects[0].description).toBe(base.projects[0].description);
  });

  it("keeps an honest rewrite", async () => {
    const { sameSubject } = await import("@/lib/resume");
    expect(sameSubject("Fixed UI bugs in a React dashboard and wrote reusable components.", "Resolved user interface issues in a React dashboard and constructed modular, reusable components.")).toBe(true);
  });
});
