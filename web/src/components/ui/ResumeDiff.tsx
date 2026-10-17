"use client";

import { Undo2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "./Button";

export type DiffLine = { id: string; section: string; before: string; after: string };

type Props = {
  lines: DiffLine[];
  /** Called with the accepted text per line id when the user downloads. */
  onDownload?: (accepted: Record<string, string>) => void | Promise<void>;
  downloading?: boolean;
  readOnly?: boolean;
};

/**
 * Before / Tailored on one white sheet (DESIGN.md §6), each line pair side by side so changes line up.
 * Desktop: two columns. Mobile: one column with a toggle.
 * Changed lines: old struck through in ink-3, new with the highlighter that settles. Unchanged lines show once per column.
 */
export function ResumeDiff({ lines, onDownload, downloading, readOnly }: Props) {
  const [undone, setUndone] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"before" | "after">("after");
  const sections = useMemo(() => [...new Set(lines.map((l) => l.section))], [lines]);
  const changed = (l: DiffLine) => l.before.trim() !== l.after.trim();
  const total = lines.filter(changed).length;
  const changedCount = lines.filter((l) => changed(l) && !undone.has(l.id)).length;

  const toggle = (id: string) =>
    setUndone((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  // On mobile only the chosen column shows; from md both do
  const col = (mode: "before" | "after") => (view === mode ? "" : "hidden md:block");

  return (
    <div>
      <div className="mb-3 inline-flex rounded-control border border-line p-1 md:hidden" role="tablist" aria-label="Resume version">
        {(["before", "after"] as const).map((v) => (
          <button
            key={v}
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className={`h-9 rounded-chip px-4 text-small font-medium transition-colors duration-[180ms] ${view === v ? "bg-ink text-white" : "text-ink-2 hover:text-ink"}`}
          >
            {v === "before" ? "Before" : `Tailored · ${changedCount}`}
          </button>
        ))}
      </div>

      <div className="panel overflow-hidden">
        <div className="grid border-b border-line bg-paper-2 text-small font-medium text-ink-2 md:grid-cols-2">
          <p className={`px-5 py-3 md:px-7 ${col("before")}`}>Before</p>
          <p className={`px-5 py-3 md:border-l md:border-line md:px-7 ${col("after")}`}>
            Tailored · <span className="tabular">{changedCount}</span> of <span className="tabular">{total}</span> lines changed
          </p>
        </div>

        <div className="font-serif text-resume text-ink">
          {sections.map((sec) => (
            <section key={sec} className="grid md:grid-cols-2">
              <h4 className="col-span-full px-5 pb-1 pt-5 font-sans text-tiny font-semibold text-ink-2 md:px-7">{sec}</h4>
              {lines
                .filter((l) => l.section === sec)
                .map((l) => {
                  const isChanged = changed(l);
                  const keepOld = undone.has(l.id);
                  return (
                    <div key={l.id} className="contents">
                      <p className={`px-5 py-1 md:px-7 ${col("before")} ${isChanged && !keepOld ? "text-ink-3 line-through decoration-ink-3/60" : ""}`}>{l.before}</p>
                      <div className={`flex items-start gap-2 px-5 py-1 md:border-l md:border-line md:px-7 ${col("after")}`}>
                        <p className={`-ml-2.5 flex-1 rounded-r-chip border-l-2 pl-2 ${isChanged && !keepOld ? "settle border-highlight" : "border-transparent"}`}>{keepOld || !isChanged ? l.before : l.after}</p>
                        {isChanged && !readOnly && (
                          <button
                            type="button"
                            onClick={() => toggle(l.id)}
                            className="-mt-1 inline-flex min-h-8 min-w-8 shrink-0 items-center justify-center rounded-chip font-sans text-tiny font-medium text-action transition-colors duration-[180ms] hover:bg-paper-2 focus-visible:outline-2 focus-visible:outline-action"
                            aria-label={keepOld ? `Redo change in ${sec}` : `Undo change in ${sec}`}
                            title={keepOld ? "Use the tailored line" : "Keep the original line"}
                          >
                            {keepOld ? "Redo" : <Undo2 size={16} strokeWidth={1.5} aria-hidden />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </section>
          ))}
          <div className="h-5" />
        </div>
      </div>

      {!readOnly && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            loading={downloading}
            onClick={() => onDownload?.(Object.fromEntries(lines.map((l) => [l.id, undone.has(l.id) ? l.before : l.after])))}
          >
            Download PDF
          </Button>
          {undone.size > 0 && (
            <Button variant="secondary" onClick={() => setUndone(new Set())}>
              Accept all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
