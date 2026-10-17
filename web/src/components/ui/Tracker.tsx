"use client";

import { LayoutGroup, LazyMotion, domAnimation, m } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { shortDate } from "@/lib/format";

export const STAGES = [
  { key: "saved", label: "Saved" },
  { key: "applied", label: "Applied" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "rejected", label: "Rejected" },
] as const;
export type StageKey = (typeof STAGES)[number]["key"];

export type TrackerItem = { jobId: string; title: string; company: string; stage: StageKey; updatedAt: string };

const spring = { type: "spring", stiffness: 400, damping: 32 } as const;

/** Kanban on desktop (drag between columns), segmented control on mobile. */
export function Tracker({ items: initial, onMove }: { items: TrackerItem[]; onMove?: (jobId: string, stage: StageKey) => void | Promise<void> }) {
  const [items, setItems] = useState(initial);
  const [mobileStage, setMobileStage] = useState<StageKey>("saved");
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<StageKey | null>(null);

  async function move(jobId: string, stage: StageKey) {
    setItems((xs) => xs.map((x) => (x.jobId === jobId ? { ...x, stage, updatedAt: new Date().toISOString() } : x)));
    await onMove?.(jobId, stage);
  }

  const Row = ({ it }: { it: TrackerItem }) => (
    <m.li
      layout
      layoutId={it.jobId}
      transition={spring}
      className="list-none"
    >
      <div
        draggable
        onDragStart={() => setDragging(it.jobId)}
        onDragEnd={() => { setDragging(null); setOver(null); }}
        className="cursor-grab rounded-control border border-line bg-paper p-3 active:cursor-grabbing"
      >
      <Link href={`/apply/${it.jobId}`} className="block text-small font-medium underline-offset-4 hover:underline">
        {it.title}
      </Link>
      <p className="text-tiny text-ink-3">
        {it.company} · {shortDate(it.updatedAt)}
      </p>
      <label className="sr-only" htmlFor={`stage-${it.jobId}`}>Move to</label>
      <select
        id={`stage-${it.jobId}`}
        value={it.stage}
        onChange={(e) => move(it.jobId, e.target.value as StageKey)}
        className="mt-2 h-9 w-full rounded-chip border border-line bg-paper-2 px-2 text-tiny md:sr-only md:focus:not-sr-only"
      >
        {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
      </select>
      </div>
    </m.li>
  );

  return (
    <LazyMotion features={domAnimation}>
      <LayoutGroup>
        <div className="md:hidden">
          <div role="tablist" aria-label="Stage" className="mb-4 flex overflow-x-auto rounded-control border border-line p-1">
            {STAGES.map((s) => (
              <button
                key={s.key}
                role="tab"
                aria-selected={mobileStage === s.key}
                onClick={() => setMobileStage(s.key)}
                className={`h-10 flex-1 shrink-0 whitespace-nowrap rounded-chip px-3 text-small font-medium ${mobileStage === s.key ? "bg-ink text-white" : "text-ink-2"}`}
              >
                {s.label} <span className="tabular">{items.filter((i) => i.stage === s.key).length}</span>
              </button>
            ))}
          </div>
          <ul className="space-y-2">
            {items.filter((i) => i.stage === mobileStage).map((it) => <Row key={it.jobId} it={it} />)}
          </ul>
        </div>

        <div className="hidden gap-3 md:grid md:grid-cols-5">
          {STAGES.map((s) => {
            const col = items.filter((i) => i.stage === s.key);
            return (
              <section
                key={s.key}
                aria-label={s.label}
                onDragOver={(e) => { e.preventDefault(); setOver(s.key); }}
                onDragLeave={() => setOver(null)}
                onDrop={() => { if (dragging) move(dragging, s.key); setOver(null); }}
                className={`min-h-64 rounded-panel bg-paper-2 p-3 transition-colors duration-[180ms] ${over === s.key ? "outline-2 outline-dashed outline-action" : ""}`}
              >
                <h2 className="mb-3 text-small font-semibold text-ink-2">
                  {s.label} <span className="tabular text-ink-3">{col.length}</span>
                </h2>
                <ul className="space-y-2">{col.map((it) => <Row key={it.jobId} it={it} />)}</ul>
              </section>
            );
          })}
        </div>
      </LayoutGroup>
    </LazyMotion>
  );
}
