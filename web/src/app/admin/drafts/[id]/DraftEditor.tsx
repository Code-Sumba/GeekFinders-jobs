"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { reviewDraft, saveDraft } from "../actions";

type Draft = { id: string; title: string; summary: string; body_md: string; freshers_note: string; status: string };

export function DraftEditor({ draft, initialNotes, overlap: initialOverlap }: { draft: Draft; initialNotes: string[]; overlap: number }) {
  const [d, setD] = useState(draft);
  const [notes, setNotes] = useState(initialNotes);
  const [overlap, setOverlap] = useState(initialOverlap);
  const [msg, setMsg] = useState("");
  const [ack, setAck] = useState(false);
  const [pending, start] = useTransition();
  const editable = d.status === "draft";
  const words = `${d.body_md} ${d.freshers_note}`.split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-small text-ink-2">Status: <span className="font-semibold capitalize text-ink">{d.status}</span> · <span className="tabular">{words}</span> words · longest shared run <span className={`tabular ${overlap >= 8 ? "text-danger" : ""}`}>{overlap}</span></p>
        {notes.length > 0 ? (
          <ul className="mt-3 space-y-1 rounded-panel border border-warning p-4 text-small text-warning">
            {notes.map((n) => <li key={n}>{n}</li>)}
          </ul>
        ) : (
          <p className="mt-3 text-small text-success">All automated checks passed. Read it once more as a human editor.</p>
        )}
      </div>
      <div>
        <label htmlFor="d-title" className="label">Title</label>
        <input id="d-title" className="input" value={d.title} disabled={!editable} onChange={(e) => setD({ ...d, title: e.target.value })} />
      </div>
      <div>
        <label htmlFor="d-summary" className="label">Summary</label>
        <textarea id="d-summary" rows={2} className="input h-auto py-2" value={d.summary} disabled={!editable} onChange={(e) => setD({ ...d, summary: e.target.value })} />
      </div>
      <div>
        <label htmlFor="d-body" className="label">Article (Markdown)</label>
        <textarea id="d-body" rows={24} className="input h-auto py-2 font-serif text-resume" value={d.body_md} disabled={!editable} onChange={(e) => setD({ ...d, body_md: e.target.value })} />
      </div>
      <div>
        <label htmlFor="d-note" className="label">What this means for freshers</label>
        <textarea id="d-note" rows={6} className="input h-auto py-2 font-serif text-resume" value={d.freshers_note} disabled={!editable} onChange={(e) => setD({ ...d, freshers_note: e.target.value })} />
      </div>
      {editable && (
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            loading={pending}
            onClick={() =>
              start(async () => {
                const r = await saveDraft(d);
                if (r.ok) { setNotes(r.checks.notes); setOverlap(r.checks.overlap); setMsg("Saved and re-checked"); }
                else setMsg(r.error);
              })
            }
          >
            Save and re-check
          </Button>
          <Button loading={pending} disabled={notes.length > 0 && !ack} onClick={() => start(async () => { const r = await reviewDraft({ id: d.id, action: "approve" }); if (r && !r.ok) setMsg(r.error); })}>
            Approve and publish
          </Button>
          <Button variant="danger" disabled={pending} onClick={() => start(async () => { await reviewDraft({ id: d.id, action: "reject" }); })}>
            Reject
          </Button>
        </div>
      )}
      {notes.length > 0 && editable && (
        <label className="flex items-start gap-2 text-small text-ink-2">
          <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5 size-5 accent-action" />
          I checked every flagged item against the fact list and sources. The remaining flags are false alarms.
        </label>
      )}
      {msg && <p className="text-small text-ink-2" role="status">{msg}</p>}
    </div>
  );
}
