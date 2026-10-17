import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/landing/PublicShell";
import { CITIES, ROLES } from "@/lib/hubs";

export const metadata: Metadata = {
  title: "Fresher jobs by role and city",
  description: "Browse fresher jobs for React, Java, Python, data analyst and more in Bengaluru, Pune, Hyderabad, Mumbai and remote. Updated every morning.",
  alternates: { canonical: "/jobs" },
};

export default function JobsIndex() {
  return (
    <PublicShell>
      <div className="wrap pb-24 pt-8 md:pt-12">
        <h1 className="text-h1 font-bold md:text-h1-lg">Fresher jobs by role and city</h1>
        <p className="mt-2 max-w-[60ch] text-body text-ink-2">Every list is refreshed each morning from licensed job aggregators and company career pages.</p>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((r) => (
            <section key={r.slug}>
              <h2 className="text-h3 font-semibold">{r.name}</h2>
              <ul className="mt-2 space-y-0.5">
                {CITIES.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/jobs/${r.slug}-fresher-${c.slug}`} className="inline-flex min-h-9 items-center text-body text-action underline-offset-4 hover:underline">
                      {c.slug === "remote" ? "Remote" : c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
