import { PublicShell } from "./PublicShell";

export function LegalPage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <PublicShell>
      <article className="mx-auto max-w-reading px-4 pb-24 pt-10 md:pt-16">
        <h1 className="text-h1 font-bold md:text-h1-lg">{title}</h1>
        {updated && <p className="mt-2 text-small text-ink-3">Last updated {updated}</p>}
        <div className="mt-8 space-y-5 text-body text-ink-2 [&_a]:text-action [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-10 [&_h2]:text-h3 [&_h2]:font-semibold [&_h2]:text-ink [&_li]:mt-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </article>
    </PublicShell>
  );
}
