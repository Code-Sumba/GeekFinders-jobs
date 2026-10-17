import type { JobCardJob } from "@/components/ui/JobCard";
import { FRESH, JOB_COLS, publicClient } from "./public-data";

/** City × role job hubs (SEO plan §8). A hub is indexable only with ≥ 10 live jobs. */
export const HUB_MIN_JOBS = 10;

export const ROLES = [
  { slug: "react-developer", name: "React Developer", terms: ["react"] },
  { slug: "frontend-developer", name: "Frontend Developer", terms: ["frontend", "front end", "front-end"] },
  { slug: "java-developer", name: "Java Developer", terms: ["java developer", "java engineer", "java backend", "java full stack", "java intern"] },
  { slug: "python-developer", name: "Python Developer", terms: ["python"] },
  { slug: "data-analyst", name: "Data Analyst", terms: ["data analyst", "analytics"] },
  { slug: "software-engineer", name: "Software Engineer", terms: ["software engineer", "software developer", "sde"] },
  { slug: "full-stack-developer", name: "Full Stack Developer", terms: ["full stack", "fullstack", "mern"] },
  { slug: "web-developer", name: "Web Developer", terms: ["web developer"] },
  { slug: "android-developer", name: "Android Developer", terms: ["android"] },
  { slug: "devops-engineer", name: "DevOps Engineer", terms: ["devops", "cloud engineer", "sre"] },
] as const;

export const CITIES = [
  { slug: "bengaluru", name: "Bengaluru", terms: ["bengaluru", "bangalore"] },
  { slug: "pune", name: "Pune", terms: ["pune"] },
  { slug: "hyderabad", name: "Hyderabad", terms: ["hyderabad"] },
  { slug: "mumbai", name: "Mumbai", terms: ["mumbai", "navi mumbai", "thane"] },
  { slug: "chennai", name: "Chennai", terms: ["chennai"] },
  { slug: "delhi-ncr", name: "Delhi NCR", terms: ["delhi", "gurgaon", "gurugram", "noida"] },
  { slug: "kolhapur", name: "Kolhapur", terms: ["kolhapur"] },
  { slug: "remote", name: "Remote", terms: [] },
] as const;

export type Hub = { slug: string; role: (typeof ROLES)[number]; city: (typeof CITIES)[number] };

export function parseHub(slug: string): Hub | null {
  const m = /^([a-z-]+)-fresher-([a-z-]+)$/.exec(slug);
  if (!m) return null;
  const role = ROLES.find((r) => r.slug === m[1]);
  const city = CITIES.find((c) => c.slug === m[2]);
  return role && city ? { slug, role, city } : null;
}

export const allHubs = (): Hub[] => ROLES.flatMap((role) => CITIES.map((city) => ({ slug: `${role.slug}-fresher-${city.slug}`, role, city })));

const esc = (s: string) => s.replace(/[%_,()]/g, " ").trim();

export async function hubJobs(hub: Hub, limit = 60): Promise<JobCardJob[]> {
  const db = publicClient();
  if (!db) return [];
  let q = db
    .from("jobs")
    .select(JOB_COLS)
    .eq("fresher_friendly", true)
    .gte("created_at", FRESH())
    .or(hub.role.terms.map((t) => `title.ilike.%${esc(t)}%`).join(","))
    .order("posted_at", { ascending: false })
    .limit(limit);
  q = hub.city.slug === "remote" ? q.eq("remote", true) : q.or(hub.city.terms.map((t) => `location.ilike.%${esc(t)}%`).join(","));
  const { data } = await q;
  return (data ?? []) as JobCardJob[];
}

/** Unique data GeeksFinder owns: openings this week, common skills, top hiring companies. */
export function hubStats(jobs: JobCardJob[]) {
  const weekAgo = Date.now() - 7 * 86_400_000;
  const thisWeek = jobs.filter((j) => j.posted_at && new Date(j.posted_at).getTime() >= weekAgo).length;
  const tally = (xs: string[]) => {
    const m = new Map<string, number>();
    xs.forEach((x) => m.set(x, (m.get(x) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  return {
    total: jobs.length,
    thisWeek,
    skills: tally(jobs.flatMap((j) => j.skills)).slice(0, 8),
    companies: tally(jobs.map((j) => j.company)).slice(0, 6),
  };
}

/** Live-job count for every hub from a single query (used by the sitemap). */
export async function hubCounts(): Promise<Map<string, number>> {
  const db = publicClient();
  const counts = new Map<string, number>();
  if (!db) return counts;
  const { data } = await db.from("jobs").select("title, location, remote").eq("fresher_friendly", true).gte("created_at", FRESH()).limit(10000);
  for (const j of data ?? []) {
    const title = ` ${j.title.toLowerCase()} `;
    const loc = (j.location ?? "").toLowerCase();
    for (const h of allHubs()) {
      const roleHit = h.role.terms.some((t) => title.includes(t));
      const cityHit = h.city.slug === "remote" ? !!j.remote : h.city.terms.some((t) => loc.includes(t));
      if (roleHit && cityHit) counts.set(h.slug, (counts.get(h.slug) ?? 0) + 1);
    }
  }
  return counts;
}
