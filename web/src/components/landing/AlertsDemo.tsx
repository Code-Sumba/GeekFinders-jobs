"use client";

import { useState } from "react";

const FREQ = [
  { v: "daily", l: "Daily", d: "Every morning at 7:30" },
  { v: "weekly", l: "Weekly", d: "Monday morning digest" },
  { v: "monthly", l: "Monthly", d: "1st of every month" },
];

/** Real controls, no signup needed — shows what each choice means. */
export function AlertsDemo() {
  const [freq, setFreq] = useState("daily");
  const [tg, setTg] = useState(true);
  const [mail, setMail] = useState(false);
  const channels = [tg && "Telegram", mail && "email"].filter(Boolean).join(" and ");
  const f = FREQ.find((x) => x.v === freq)!;

  return (
    <div className="panel grid gap-6 p-6 md:grid-cols-[1fr_1fr_1.2fr] md:items-center md:p-8">
      <fieldset>
        <legend className="label">How often</legend>
        <div className="flex rounded-control border border-line p-1">
          {FREQ.map((x) => (
            <label key={x.v} className={`flex h-10 flex-1 cursor-pointer items-center justify-center rounded-chip text-small font-medium transition-colors duration-[180ms] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-action ${freq === x.v ? "bg-ink text-white" : "text-ink-2"}`}>
              <input type="radio" name="demo-freq" value={x.v} checked={freq === x.v} onChange={() => setFreq(x.v)} className="sr-only" />
              {x.l}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="label">Where</legend>
        <div className="flex gap-4">
          {[
            { l: "Telegram", v: tg, set: setTg },
            { l: "Email", v: mail, set: setMail },
          ].map((c) => (
            <label key={c.l} className="flex min-h-11 cursor-pointer items-center gap-2 text-body">
              <input type="checkbox" checked={c.v} onChange={(e) => c.set(e.target.checked)} className="size-5 accent-action" />
              {c.l}
            </label>
          ))}
        </div>
      </fieldset>
      <p className="text-body text-ink-2" aria-live="polite">
        {channels ? (
          <>
            <span className="font-semibold text-ink">{f.d}</span>, your top matches arrive on {channels}.
            {freq === "daily" && " Daily alerts come with every paid plan."}
          </>
        ) : (
          "Pick at least one place to get alerts. Telegram is instant and free."
        )}
      </p>
    </div>
  );
}
