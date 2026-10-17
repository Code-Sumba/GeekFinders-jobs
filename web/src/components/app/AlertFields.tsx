"use client";

import Link from "next/link";
import { TelegramConnect } from "./TelegramConnect";

export type AlertValues = { frequency: string; channels: string[]; alertHour: number; quietStart: number; quietEnd: number };

const FREQ = [
  { v: "daily", l: "Daily", d: "Top matches every morning" },
  { v: "weekly", l: "Weekly", d: "Monday digest" },
  { v: "monthly", l: "Monthly", d: "1st of the month" },
];
const hourLabel = (h: number) => `${((h + 11) % 12) + 1}:30 ${h < 12 ? "AM" : "PM"}`;

export function AlertFields({
  value,
  onChange,
  plan,
  telegramConnected,
  showQuiet = false,
}: {
  value: AlertValues;
  onChange: (v: AlertValues) => void;
  plan: "free" | "pro";
  telegramConnected: boolean;
  showQuiet?: boolean;
}) {
  const set = (patch: Partial<AlertValues>) => onChange({ ...value, ...patch });
  const toggle = (c: string) => set({ channels: value.channels.includes(c) ? value.channels.filter((x) => x !== c) : [...value.channels, c] });

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="label">Where should we send alerts?</legend>
        <div className="space-y-3">
          <div className={`rounded-panel border p-4 ${value.channels.includes("telegram") ? "border-action" : "border-line"}`}>
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={value.channels.includes("telegram")} onChange={() => toggle("telegram")} className="mt-1 size-5 accent-action" />
              <span>
                <span className="flex flex-wrap items-center gap-2 text-body font-semibold">
                  Telegram <span className="rounded-chip border border-action px-1.5 text-tiny font-medium text-action">Recommended</span>
                </span>
                <span className="block text-small text-ink-2">Instant and free. Each job comes with Tailor resume and Email HR buttons.</span>
              </span>
            </label>
            {value.channels.includes("telegram") && (
              <div className="mt-4 pl-8">
                <TelegramConnect connected={telegramConnected} />
              </div>
            )}
          </div>
          <label className={`flex cursor-pointer items-start gap-3 rounded-panel border p-4 ${value.channels.includes("email") ? "border-action" : "border-line"}`}>
            <input type="checkbox" checked={value.channels.includes("email")} onChange={() => toggle("email")} className="mt-1 size-5 accent-action" />
            <span>
              <span className="block text-body font-semibold">Email</span>
              <span className="block text-small text-ink-2">A digest in your inbox. Good as a backup.</span>
            </span>
          </label>
        </div>
        {value.channels.length === 0 && <p className="mt-2 text-small text-danger">Pick at least one place to get alerts.</p>}
      </fieldset>

      <fieldset>
        <legend className="label">How often?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {FREQ.map((f) => {
            const locked = f.v === "daily" && plan === "free";
            return (
              <label
                key={f.v}
                className={`rounded-control border p-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-action ${value.frequency === f.v ? "border-action" : "border-line"} ${locked ? "opacity-60" : "cursor-pointer"}`}
              >
                <input type="radio" name="frequency" value={f.v} checked={value.frequency === f.v} disabled={locked} onChange={() => set({ frequency: f.v })} className="sr-only" />
                <span className="block text-body font-semibold">{f.l}</span>
                <span className="block text-small text-ink-2">{f.d}</span>
                {locked && <Link href="/billing" className="text-small text-action underline-offset-4 hover:underline">Paid plans</Link>}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="alert-hour" className="label">Alert time</label>
        <select id="alert-hour" value={value.alertHour} onChange={(e) => set({ alertHour: Number(e.target.value) })} className="input w-48">
          {Array.from({ length: 18 }, (_, i) => i + 5).map((h) => (
            <option key={h} value={h}>{hourLabel(h)}</option>
          ))}
        </select>
      </div>

      {showQuiet && (
        <fieldset>
          <legend className="label">Quiet hours</legend>
          <div className="flex flex-wrap items-center gap-2 text-body">
            <span>No alerts from</span>
            <label className="sr-only" htmlFor="q-start">Quiet hours start</label>
            <select id="q-start" value={value.quietStart} onChange={(e) => set({ quietStart: Number(e.target.value) })} className="input w-28">
              {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
            </select>
            <span>to</span>
            <label className="sr-only" htmlFor="q-end">Quiet hours end</label>
            <select id="q-end" value={value.quietEnd} onChange={(e) => set({ quietEnd: Number(e.target.value) })} className="input w-28">
              {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
            </select>
          </div>
        </fieldset>
      )}
    </div>
  );
}
