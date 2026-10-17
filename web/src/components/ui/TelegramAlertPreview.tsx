export type AlertJob = { title: string; company: string; city: string; score: number };

export const SAMPLE_ALERT: AlertJob[] = [
  { title: "Frontend Developer Intern", company: "Zepto", city: "Bengaluru", score: 87 },
  { title: "Junior React Developer", company: "Razorpay", city: "Bengaluru", score: 82 },
  { title: "Software Engineer – Fresher", company: "Postman", city: "Remote", score: 74 },
];

/** Neutral chat UI inside a phone frame (no Telegram branding). */
export function TelegramAlertPreview({
  name = "Priya",
  jobs = SAMPLE_ALERT,
  pulseClassName = "",
  className = "",
}: {
  name?: string;
  jobs?: AlertJob[];
  /** Class applied to the "Tailor resume" button (hero uses a one-time ring pulse). */
  pulseClassName?: string;
  className?: string;
}) {
  return (
    <div className={`w-[17.5rem] rounded-[2rem] border border-line bg-paper p-2.5 shadow-float ${className}`} role="img" aria-label={`Sample alert: ${jobs.length} new matches for ${name}`}>
      <div className="overflow-hidden rounded-[1.5rem] bg-paper-2">
        <div className="flex items-center gap-2 border-b border-line bg-paper px-3 py-2.5">
          <div aria-hidden className="grid size-8 place-items-center rounded-full bg-action text-small font-bold text-white">G</div>
          <div className="leading-tight">
            <p className="text-small font-semibold">GeeksFinder</p>
            <p className="text-tiny text-ink-3">bot</p>
          </div>
        </div>
        <div className="space-y-2 p-3">
          <div className="rounded-control rounded-tl-chip bg-paper p-3 text-small">
            <p className="font-semibold">Good morning, {name}</p>
            <p className="text-ink-2">{jobs.length} new matches for you</p>
            <ul className="mt-2 space-y-2">
              {jobs.map((j) => (
                <li key={j.title} className="border-t border-line pt-2 first:border-0 first:pt-0">
                  <p className="font-medium leading-snug">{j.title}</p>
                  <p className="text-tiny text-ink-3">
                    {j.company} · {j.city} · <span className="tabular font-semibold text-success">{j.score}%</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <span
              data-tailor
              className={`rounded-control bg-paper py-2 text-center text-tiny font-medium text-action ${pulseClassName}`}
            >
              Tailor resume
            </span>
            <span className="rounded-control bg-paper py-2 text-center text-tiny font-medium text-action">Open job</span>
          </div>
        </div>
      </div>
    </div>
  );
}
