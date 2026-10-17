"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { DEFAULT_PLAN, FREE_PLAN, PAID_PLANS, PLANS, type PaidPlan } from "@/lib/pricing";
import { Button, ButtonLink } from "./Button";

// Short labels for the narrow plan tiles (full wording shows under the big price)
const PER: Record<PaidPlan, string> = { hustle: "per 15 days", season: "per 3 months", yearpass: "per year" };

const FREE = ["Weekly job alerts", "1 tailored resume", "Application tracker"];
const PAID = ["Daily alerts on Telegram and email", "10 tailored resumes every 15 days", "HR email finder and drafts", "Follow-up reminders after 5 days"];

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-2.5">
      {items.map((i) => (
        <li key={i} className="flex gap-2 text-body text-ink-2">
          <Check size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-success" aria-hidden />
          {i}
        </li>
      ))}
    </ul>
  );
}

type Props = {
  freeAction: React.ReactNode;
  /** Billing page: start checkout for the chosen plan. Without it (landing page) the button links to sign-in. */
  onSubscribe?: (plan: PaidPlan) => void;
  busy?: boolean;
  initialPlan?: PaidPlan;
};

/** Fresher (free) beside one framed panel for paid plans; the student picks how often Autopay debits. */
export function PricingBlock({ freeAction, onSubscribe, busy, initialPlan = DEFAULT_PLAN }: Props) {
  const [chosen, setChosen] = useState<PaidPlan>(initialPlan);
  const p = PLANS[chosen];

  return (
    <div className="grid gap-4 md:grid-cols-5">
      <div className="panel flex flex-col p-6 md:col-span-2 md:p-8">
        <h3 className="text-h3 font-semibold">{FREE_PLAN.name}</h3>
        <p className="mt-1 text-small text-ink-2">Free while you look around</p>
        <p className="mt-3">
          <span className="tabular text-h1 font-bold md:text-h1-lg">₹0</span>
        </p>
        <List items={FREE} />
        <div className="mt-auto pt-8">{freeAction}</div>
      </div>

      <div className="flex flex-col rounded-panel border-2 border-action bg-paper p-6 md:col-span-3 md:p-8">
        <fieldset>
          <legend className="text-h3 font-semibold">Paid plans</legend>
          <p className="mt-1 text-small text-ink-2">Same features on every plan. Pick how often you pay.</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {PAID_PLANS.map((code) => {
              const plan = PLANS[code];
              const on = chosen === code;
              return (
                <label
                  key={code}
                  className={`relative flex cursor-pointer flex-col rounded-control border p-3 transition-colors duration-[180ms] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action ${on ? "border-action bg-paper-2" : "border-line hover:border-ink-3"}`}
                >
                  <input type="radio" name="paid-plan" value={code} checked={on} onChange={() => setChosen(code)} className="sr-only" />
                  {code === "yearpass" && (
                    <span className="absolute -top-2.5 right-3 whitespace-nowrap rounded-chip bg-highlight px-1.5 text-tiny font-medium text-ink">Best value</span>
                  )}
                  <span className="whitespace-nowrap text-small font-semibold text-ink">{plan.name}</span>
                  <span className="tabular mt-1 text-h3 font-semibold text-ink">₹{plan.price}</span>
                  <span className="text-small text-ink-2">{PER[code]}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <p className="mt-5 flex items-baseline gap-2" aria-live="polite">
          <span className="tabular text-h1 font-bold md:text-h1-lg">₹{p.price}</span>
          <span className="text-body text-ink-2">{p.every}</span>
        </p>
        <p className="text-small text-ink-2">{p.note}</p>
        <List items={PAID} />
        <div className="mt-auto pt-8">
          {onSubscribe ? (
            <Button className="w-full" loading={busy} onClick={() => onSubscribe(chosen)}>
              Start 7-day free trial · {p.name}
            </Button>
          ) : (
            <ButtonLink href={`/login?next=${encodeURIComponent(`/billing?plan=${chosen}`)}`} className="w-full">
              Start 7-day free trial · {p.name}
            </ButtonLink>
          )}
          <p className="mt-3 text-small text-ink-2">7-day free trial · Autopay via UPI · Cancel anytime from your UPI app</p>
        </div>
      </div>
    </div>
  );
}
