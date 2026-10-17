import type { MetadataRoute } from "next";
import { HUB_MIN_JOBS, hubCounts } from "@/lib/hubs";
import { publicClient } from "@/lib/public-data";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic"; // query at request time, not at build
export const revalidate = 86400;

const CORE = ["", "/blog", "/jobs", "/tools", "/tools/ats-resume-checker", "/tools/hr-email-generator", "/about", "/editorial-policy", "/contact", "/privacy", "/terms", "/refund-policy", "/hr-opt-out"];

/** Core pages, published articles, and only job hubs with ≥ 10 live jobs (thin hubs stay out). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const core = CORE.map((p) => ({ url: `${SITE.url}${p}`, lastModified: now, changeFrequency: p === "" || p === "/blog" ? ("daily" as const) : ("monthly" as const), priority: p === "" ? 1 : 0.6 }));

  const db = publicClient();
  if (!db) return core;

  const { data: articles } = await db.from("articles").select("slug, published_at, updated_at").order("published_at", { ascending: false }).limit(5000);
  const blog = (articles ?? []).map((a) => ({ url: `${SITE.url}/blog/${a.slug}`, lastModified: new Date(a.updated_at ?? a.published_at), changeFrequency: "weekly" as const, priority: 0.7 }));

  const counts = await hubCounts();
  const hubs: MetadataRoute.Sitemap = [...counts.entries()]
    .filter(([, n]) => n >= HUB_MIN_JOBS)
    .map(([slug]) => ({ url: `${SITE.url}/jobs/${slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 }));
  return [...core, ...blog, ...hubs];
}
