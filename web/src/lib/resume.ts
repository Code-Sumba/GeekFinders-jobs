import type { SupabaseClient } from "@supabase/supabase-js";
import type { DiffLine } from "@/components/ui/ResumeDiff";
import type { ParsedResume } from "./ai";

/** Assemble the user's base resume from their profile + user rows. */
export async function loadResume(supabase: SupabaseClient, userId: string): Promise<ParsedResume | null> {
  const [{ data: p }, { data: u }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("users").select("name, email, phone").eq("id", userId).single(),
  ]);
  if (!p) return null;
  return {
    name: u?.name ?? "",
    email: u?.email ?? "",
    phone: u?.phone ?? "",
    summary: "",
    skills: p.skills ?? [],
    education: p.education ?? [],
    projects: p.projects ?? [],
    experience: p.experience ?? [],
    experience_level: p.experience_level ?? "fresher",
  };
}

/** Guard against the model inventing skills or facts: drop any skill not in the original, keep structure fixed. */
export function enforceNoNewSkills(original: ParsedResume, tailored: ParsedResume): ParsedResume {
  const allowed = new Set(original.skills.map((s) => s.toLowerCase()));
  const kept = (tailored.skills ?? []).filter((s) => allowed.has(String(s).toLowerCase()));
  const missing = original.skills.filter((s) => !kept.some((k) => k.toLowerCase() === s.toLowerCase()));
  const numbers = (s: string) => new Set(s.match(/\d+(?:\.\d+)?%?/g) ?? []);
  const origNums = numbers(JSON.stringify(original));
  // Reject a rewritten line if it introduces a number that isn't anywhere in the original,
  // or if it no longer describes the same thing (e.g. the model swapped two projects' descriptions)
  const safe = (orig: string, next?: string) =>
    next && [...numbers(next)].every((n) => origNums.has(n)) && (!orig || sameSubject(orig, next)) ? next : orig;
  const key = (s?: string) => (s ?? "").trim().toLowerCase();
  // Match by name, never by position — a reordered list must not move text onto the wrong project/job
  const projectFor = (p: ParsedResume["projects"][number]) => (tailored.projects ?? []).find((t) => key(t?.name) === key(p.name));
  const jobFor = (e: ParsedResume["experience"][number]) =>
    (tailored.experience ?? []).find((t) => key(t?.company) === key(e.company) && key(t?.role) === key(e.role));

  return {
    ...original,
    summary: safe("", tailored.summary ?? ""),
    skills: [...kept, ...missing],
    projects: original.projects.map((p) => ({ ...p, description: safe(p.description, projectFor(p)?.description) })),
    experience: original.experience.map((e) => {
      const t = jobFor(e);
      return { ...e, bullets: e.bullets.map((b, j) => safe(b, t?.bullets?.[j])) };
    }),
  };
}

const STOP = new Set(["with", "and", "the", "for", "from", "that", "this", "into", "using", "built", "made", "developed", "created", "wrote", "implemented"]);
const words = (s: string) => new Set((s.toLowerCase().match(/[a-z0-9.+#]{3,}/g) ?? []).filter((w) => !STOP.has(w)));

/** A rewrite must keep at least a third of the original line's content words. */
export function sameSubject(orig: string, next: string): boolean {
  const a = words(orig);
  if (a.size < 3) return true;
  const b = words(next);
  let shared = 0;
  for (const w of a) if (b.has(w)) shared++;
  return shared / a.size >= 1 / 3;
}

type Line = { id: string; section: string; text: string };

function lines(r: ParsedResume): Line[] {
  const out: Line[] = [];
  out.push({ id: "summary", section: "Summary", text: r.summary ?? "" });
  out.push({ id: "skills", section: "Skills", text: r.skills.join(", ") });
  r.experience.forEach((e, i) => e.bullets.forEach((b, j) => out.push({ id: `exp-${i}-${j}`, section: `${e.role} — ${e.company}`, text: b })));
  r.projects.forEach((p, i) => out.push({ id: `proj-${i}`, section: "Projects", text: p.name ? `${p.name} — ${p.description}` : p.description }));
  r.education.forEach((e, i) => out.push({ id: `edu-${i}`, section: "Education", text: [e.degree, e.institution, e.year, e.score].filter(Boolean).join(" · ") }));
  return out;
}

export function diffLines(original: ParsedResume, tailored: ParsedResume): DiffLine[] {
  const before = new Map(lines(original).map((l) => [l.id, l]));
  return lines(tailored)
    .filter((l) => l.text || before.get(l.id)?.text)
    .map((l) => ({ id: l.id, section: l.section, before: before.get(l.id)?.text ?? "", after: l.text }));
}

/**
 * Build the final resume from the per-line choices (Undo keeps the original line).
 * Only accepts, per line, either the original or the tailored text — nothing else.
 */
export function applyChoices(original: ParsedResume, tailored: ParsedResume, accepted?: Record<string, string>): ParsedResume {
  if (!accepted) return tailored;
  const pick = (id: string, orig: string, next: string) => (accepted[id] === orig ? orig : next);
  const r: ParsedResume = structuredClone(tailored);
  r.summary = pick("summary", original.summary ?? "", tailored.summary ?? "");
  if (accepted.skills === original.skills.join(", ")) r.skills = [...original.skills];
  r.experience = tailored.experience.map((e, i) => ({
    ...e,
    bullets: e.bullets.map((b, j) => pick(`exp-${i}-${j}`, original.experience[i]?.bullets[j] ?? b, b)),
  }));
  r.projects = tailored.projects.map((p, i) => {
    const o = original.projects[i];
    const origLine = o ? (o.name ? `${o.name} — ${o.description}` : o.description) : "";
    return accepted[`proj-${i}`] === origLine && o ? { ...p, description: o.description } : p;
  });
  return r;
}
