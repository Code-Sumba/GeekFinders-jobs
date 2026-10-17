import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }));

const job = (over: Record<string, unknown>) => ({
  score: 70,
  reasons: {},
  created_at: new Date().toISOString(),
  jobs: { id: "j", title: "Software Engineer", company: "Okta", location: "Bangalore, India", remote: false, fresher_friendly: true, skills: ["Java", "React"], posted_at: new Date().toISOString(), apply_url: null, ...over },
});

describe("job search", () => {
  it("cleans typed text so it can't break the database filter", async () => {
    const { cleanTerm } = await import("@/lib/job-search");
    expect(cleanTerm("React),title.eq.x")).toBe("React title.eq.x");
    expect(cleanTerm("C++ / C#")).toBe("C++ / C#");
    expect(cleanTerm("%_*")).toBe("");
    expect(cleanTerm("a".repeat(100))).toHaveLength(60);
  });

  it("treats Bangalore and Bengaluru as the same city", async () => {
    const { filterRows } = await import("@/lib/job-search");
    const rows = [job({ id: "a", location: "Bangalore" }), job({ id: "b", location: "Bengaluru, Karnataka" }), job({ id: "c", location: "Pune" })];
    expect(filterRows(rows, { city: "bengaluru" }).map((r) => r.jobs.id)).toEqual(["a", "b"]);
  });

  it("finds skills by exact name in any case, or by part of the name", async () => {
    const { skillVariants } = await import("@/lib/job-search");
    const known = ["Python", "PySpark", "React", "React Native"];
    expect(skillVariants("react", known)).toEqual(["React"]);
    expect(skillVariants("py", known)).toEqual(["Python", "PySpark"]);
    expect(skillVariants("Rust", known)).toEqual(["Rust"]);
  });

  it("builds the all-jobs query only from cleaned values", async () => {
    const calls: [string, unknown[]][] = [];
    const q: Record<string, unknown> = {};
    for (const m of ["select", "eq", "gte", "ilike", "overlaps", "or", "order"]) q[m] = (...a: unknown[]) => { calls.push([m, a]); return q; };
    q.limit = async () => ({ data: [job({}).jobs].map((j) => ({ ...j, created_at: new Date().toISOString() })), count: 1 });
    const db = { from: () => q } as never;
    const { searchAllJobs } = await import("@/lib/job-search");
    const { rows, total } = await searchAllJobs(db, { role: "Engineer%", city: "Bangalore),id.eq.1", skill: "java" }, { skills: ["Java"], preferred_roles: [], locations: [] }, ["Java"]);
    expect(total).toBe(1);
    expect(rows[0].score).toBeGreaterThan(0);
    const or = calls.find(([m]) => m === "or")![1][0] as string;
    expect(or).not.toMatch(/[()]|id\.eq/);
    expect(calls.find(([m]) => m === "ilike")![1][1]).toBe("%Engineer%");
    expect(calls.find(([m]) => m === "overlaps")![1][1]).toEqual(["Java"]);
  });
});
