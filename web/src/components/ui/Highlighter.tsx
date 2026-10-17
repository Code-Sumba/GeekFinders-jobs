import { Check } from "lucide-react";

/** The signature mark. Only for matched skills and newly tailored lines. Never the only signal. */
export function Highlighter({ children, check = true }: { children: React.ReactNode; check?: boolean }) {
  return (
    <span className="hl inline-flex items-center gap-1">
      {check && <Check aria-hidden size={14} strokeWidth={2} />}
      {children}
      <span className="sr-only"> (matched)</span>
    </span>
  );
}

export function SkillChip({ name, matched }: { name: string; matched?: boolean }) {
  if (matched)
    return (
      <span className="inline-flex h-7 items-center rounded-chip px-1 text-small font-medium">
        <Highlighter>{name}</Highlighter>
      </span>
    );
  return <span className="inline-flex h-7 items-center whitespace-nowrap rounded-chip border border-line px-2 text-small text-ink-2">{name}</span>;
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" }) {
  const tones = {
    neutral: "border-line text-ink-2",
    success: "border-success text-success",
    warning: "border-warning text-warning",
  };
  return <span className={`inline-flex h-6 items-center whitespace-nowrap rounded-chip border px-2 text-tiny font-medium ${tones[tone]}`}>{children}</span>;
}
