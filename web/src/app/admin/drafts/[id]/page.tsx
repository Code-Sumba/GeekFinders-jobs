import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { uuid } from "@/lib/validate";
import { DraftEditor } from "./DraftEditor";

export default async function DraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { admin } = await requireAdmin();
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const { data: d } = await admin.from("article_drafts").select("*").eq("id", id).maybeSingle();
  if (!d) notFound();
  const facts = d.facts as { facts: { fact: string; source_url: string }[]; freshers_note?: string };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <DraftEditor
        draft={{ id: d.id, title: d.title ?? "", summary: d.summary ?? "", body_md: d.body_md ?? "", freshers_note: facts.freshers_note ?? "", status: d.status }}
        initialNotes={(d.check_notes as string[]) ?? []}
        overlap={d.overlap_score ?? 0}
      />
      <aside>
        <h2 className="mb-3 text-h3 font-semibold">Fact list ({facts.facts.length})</h2>
        <ol className="space-y-2 text-small text-ink-2">
          {facts.facts.map((f, i) => (
            <li key={i} className="border-b border-line pb-2">
              {f.fact}{" "}
              <a href={f.source_url} target="_blank" rel="noopener nofollow" className="text-action underline-offset-2 hover:underline">
                {(() => { try { return new URL(f.source_url).hostname.replace(/^www\./, ""); } catch { return "source"; } })()}
              </a>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
