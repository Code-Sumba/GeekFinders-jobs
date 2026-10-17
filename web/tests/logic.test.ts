import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { longestSharedRun, runChecks, unsupportedClaims } from "@/lib/article-checks";
import { scoreMatch } from "@/lib/matching";
import { enforceNoNewSkills } from "@/lib/resume";
import type { ParsedResume } from "@/lib/ai";
import { renderMarkdown } from "@/lib/markdown";
import { middleware } from "@/middleware";

describe("matching score", () => {
  const p = { skills: ["Python", "React", "SQL"], preferred_roles: ["Frontend Developer"], locations: ["Pune", "Remote"] };
  it("scores a fitting fresher job ≥ 60", () => {
    const r = scoreMatch(p, { title: "Junior Frontend Developer", location: "Pune, MH", remote: false, skills: ["React", "JavaScript", "CSS"], fresher_friendly: true, posted_at: new Date().toISOString() });
    expect(r.score).toBeGreaterThanOrEqual(60);
    expect(r.reasons.matched_skills).toEqual(["React"]);
  });
  it("scores an unrelated senior job low", () => {
    expect(scoreMatch(p, { title: "Senior Java Engineer", location: "Delhi", remote: false, skills: ["Java"], fresher_friendly: false, posted_at: null }).score).toBeLessThan(20);
  });
});

describe("tailoring never invents", () => {
  const original: ParsedResume = {
    name: "Priya", email: "", phone: "", summary: "", skills: ["Python", "React"], education: [],
    projects: [{ name: "Canteen app", description: "Built an ordering site in React.", tech: [] }],
    experience: [], experience_level: "fresher",
  };
  it("drops skills that weren't on the resume and keeps all originals", () => {
    const out = enforceNoNewSkills(original, { ...original, skills: ["React", "Kubernetes", "Python"] });
    expect(out.skills).toEqual(["React", "Python"]);
  });
  it("rejects a rewritten line that adds a number", () => {
    const out = enforceNoNewSkills(original, { ...original, projects: [{ ...original.projects[0], description: "Built a React ordering site used by 5000 students." }] });
    expect(out.projects[0].description).toBe("Built an ordering site in React.");
  });
});

describe("article checks", () => {
  const src = "Infosys said on Monday it will hire 20000 freshers from campuses across India in the coming financial year";
  it("detects 8+ word copied runs", () => {
    expect(longestSharedRun("The company said it will hire 20000 freshers from campuses across India soon.", [src])).toBeGreaterThanOrEqual(8);
    expect(longestSharedRun("Infosys plans to bring in 20000 graduates next year.", [src])).toBe(0);
  });
  it("flags numbers not in the fact list", () => {
    expect(unsupportedClaims("Infosys will hire 30000 freshers.", ["Infosys will hire 20000 freshers"])).toContain('number "30000"');
    expect(unsupportedClaims("Infosys will hire 20,000 freshers.", ["Infosys will hire 20000 freshers"])).toEqual([]);
  });
  it("fails short drafts", () => expect(runChecks("Too short.", "", [], []).passed).toBe(false));
});

describe("generated article XSS", () => {
  it("strips scripts, iframes and event handlers", () => {
    const html = renderMarkdown('Hi <script>alert(1)</script><img src=x onerror=alert(1)><iframe src="https://x"></iframe> [link](javascript:alert(1))');
    expect(html).not.toMatch(/<script|onerror|<iframe|javascript:/i);
  });
});

describe("CORS / CSRF", () => {
  it("blocks cross-origin POSTs to the API", async () => {
    const req = new NextRequest("http://localhost:3000/api/tailor", { method: "POST", headers: { origin: "https://evil.example", host: "localhost:3000" } });
    const res = await middleware(req);
    expect(res.status).toBe(403);
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
  });
});
