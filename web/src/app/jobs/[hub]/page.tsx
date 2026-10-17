import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { PublicShell } from "@/components/landing/PublicShell";
import { ButtonLink } from "@/components/ui/Button";
import { JobCard } from "@/components/ui/JobCard";
import { CITIES, HUB_MIN_JOBS, ROLES, hubJobs, hubStats, parseHub } from "@/lib/hubs";
import { JsonLd, breadcrumbSchema } from "@/lib/seo";

export const revalidate = 3600;

const load = cache(async (slug: string) => {
  const hub = parseHub(slug);
  if (!hub) return null;
  const jobs = await hubJobs(hub);
  return { hub, jobs, stats: hubStats(jobs) };
});

export async function generateMetadata({ params }: { params: Promise<{ hub: string }> }): Promise<Metadata> {
  const d = await load((await params).hub);
  if (!d) return { title: "Not found", robots: { index: false } };
  const where = d.hub.city.slug === "remote" ? "Remote" : `in ${d.hub.city.name}`;
  return {
    title: `${d.hub.role.name} Fresher Jobs ${where} (Updated Daily)`,
    description: `${d.stats.total} fresher ${d.hub.role.name} jobs ${where}. Skills companies ask for, who's hiring this week, and matched alerts on Telegram.`,
    alternates: { canonical: `/jobs/${d.hub.slug}` },
    // Thin hubs stay out of the index (plan §8)
    robots: d.stats.total >= HUB_MIN_JOBS ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default async function HubPage({ params }: { params: Promise<{ hub: string }> }) {
  const d = await load((await params).hub);
  if (!d) notFound();
  const { hub, jobs, stats } = d;
  const where = hub.city.slug === "remote" ? "remote" : `in ${hub.city.name}`;
  const relatedCities = CITIES.filter((c) => c.slug !== hub.city.slug).slice(0, 5);
  const relatedRoles = ROLES.filter((r) => r.slug !== hub.role.slug).slice(0, 5);

  return (
    <PublicShell>
      <JsonLd data={breadcrumbSchema([{ name: "Jobs", path: "/jobs" }, { name: `${hub.role.name} fresher jobs ${where}`, path: `/jobs/${hub.slug}` }])} />
      <div className="wrap pb-24 pt-8 md:pt-12">
        <nav aria-label="Breadcrumb" className="text-small text-ink-2">
          <Link href="/jobs" className="underline-offset-4 hover:underline">Jobs</Link> <span aria-hidden>/</span> {hub.role.name}
        </nav>
        <h1 className="mt-3 max-w-[30ch] text-h1 font-bold md:text-h1-lg">{hub.role.name} fresher jobs {where}</h1>

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-3">
          <div className="bg-paper p-4"><dt className="text-small text-ink-2">Live openings</dt><dd className="tabular text-h2 font-semibold">{stats.total}</dd></div>
          <div className="bg-paper p-4"><dt className="text-small text-ink-2">Posted this week</dt><dd className="tabular text-h2 font-semibold">{stats.thisWeek}</dd></div>
          <div className="col-span-2 bg-paper p-4 sm:col-span-1">
            <dt className="text-small text-ink-2">Top hiring</dt>
            <dd className="text-body font-medium">{stats.companies.slice(0, 3).map(([c]) => c).join(", ") || "—"}</dd>
          </div>
        </dl>

        {stats.skills.length > 0 && (
          <section className="mt-8">
            <h2 className="text-h3 font-semibold">Skills companies ask for</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {stats.skills.map(([s, n]) => (
                <li key={s} className="inline-flex h-8 items-center gap-1.5 rounded-chip border border-line px-2.5 text-small">
                  {s} <span className="tabular text-ink-3">{n}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-h3 font-semibold">Latest openings</h2>
            <ButtonLink href="/login?next=/onboarding" size="sm">Get these matched to your resume</ButtonLink>
          </div>
          {jobs.length ? (
            <div className="mt-2">{jobs.slice(0, 25).map((j) => <JobCard key={j.id} job={j} />)}</div>
          ) : (
            <p className="mt-4 text-body text-ink-2">No live openings right now. New jobs are added every morning.</p>
          )}
        </section>

        <section className="mt-12 grid gap-8 border-t border-line pt-8 md:grid-cols-2">
          <div>
            <h2 className="text-small font-semibold text-ink-2">{hub.role.name} jobs in other cities</h2>
            <ul className="mt-2 space-y-1">
              {relatedCities.map((c) => (
                <li key={c.slug}><Link href={`/jobs/${hub.role.slug}-fresher-${c.slug}`} className="text-body text-action underline-offset-4 hover:underline">{hub.role.name} fresher jobs {c.slug === "remote" ? "remote" : `in ${c.name}`}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-small font-semibold text-ink-2">Other roles {where}</h2>
            <ul className="mt-2 space-y-1">
              {relatedRoles.map((r) => (
                <li key={r.slug}><Link href={`/jobs/${r.slug}-fresher-${hub.city.slug}`} className="text-body text-action underline-offset-4 hover:underline">{r.name} fresher jobs {where}</Link></li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
