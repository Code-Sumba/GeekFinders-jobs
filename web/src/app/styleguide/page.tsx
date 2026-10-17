import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge, Highlighter, SkillChip } from "@/components/ui/Highlighter";
import { JobCard } from "@/components/ui/JobCard";
import { MatchScore } from "@/components/ui/MatchScore";
import { PricingBlock } from "@/components/ui/PricingBlock";
import { ResumeDiff } from "@/components/ui/ResumeDiff";
import { TelegramAlertPreview } from "@/components/ui/TelegramAlertPreview";
import { EmptyState } from "@/components/ui/Toast";
import { Tracker } from "@/components/ui/Tracker";
import { Wordmark } from "@/components/ui/Wordmark";
import { SAMPLE_DIFF } from "@/lib/sample";
import { ToastDemo } from "./ToastDemo";

export const metadata: Metadata = { title: "Styleguide", robots: { index: false, follow: false } };

const COLORS = ["paper", "paper-2", "line", "ink", "ink-2", "ink-3", "action", "action-dark", "highlight", "success", "warning", "danger"];
const SWATCH: Record<string, string> = {
  paper: "bg-paper", "paper-2": "bg-paper-2", line: "bg-line", ink: "bg-ink", "ink-2": "bg-ink-2", "ink-3": "bg-ink-3",
  action: "bg-action", "action-dark": "bg-action-dark", highlight: "bg-highlight", success: "bg-success", warning: "bg-warning", danger: "bg-danger",
};
const TYPE = [
  ["Display", "text-display md:text-display-lg font-bold", "Wake up to jobs that fit your resume."],
  ["H1", "text-h1 md:text-h1-lg font-bold", "Your matches"],
  ["H2", "text-h2 md:text-h2-lg font-semibold", "Less than a cup of chai every two weeks."],
  ["H3", "text-h3 font-semibold", "Frontend Developer Intern"],
  ["Body", "text-body text-ink-2", "Every morning, get fresher jobs matched to your skills on Telegram."],
  ["Small", "text-small text-ink-2", "Zepto · Bengaluru · 2 h ago"],
  ["Resume", "font-serif text-resume", "Built a React ordering site with Firebase auth."],
  ["Numbers", "tabular text-h3 font-semibold", "87% match · ₹10"],
];
const SPACE = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128];

const JOBS = [
  { id: "1", title: "Frontend Developer Intern", company: "Zepto", location: "Bengaluru", remote: false, fresher_friendly: true, skills: ["React", "TypeScript", "Git", "REST APIs"], posted_at: new Date(Date.now() - 2 * 3_600_000).toISOString() },
  { id: "2", title: "Data Analyst – Fresher", company: "Swiggy", location: "Pune", remote: false, fresher_friendly: true, skills: ["SQL", "Python", "Excel", "Power BI"], posted_at: new Date(Date.now() - 26 * 3_600_000).toISOString() },
];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-10">
      <h2 className="mb-6 text-h2 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function Styleguide() {
  return (
    <main className="wrap pb-24 pt-8">
      <Wordmark />
      <p className="mb-6 text-small text-ink-3">Internal styleguide · DESIGN.md tokens and components</p>

      <Block title="Colour">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {COLORS.map((c) => (
            <div key={c}>
              <div className={`h-16 rounded-control border border-line ${SWATCH[c]}`} />
              <p className="mt-1 text-small font-medium">{c}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Type">
        <div className="space-y-4">
          {TYPE.map(([n, cls, t]) => (
            <div key={n} className="grid gap-1 md:grid-cols-[8rem_1fr]">
              <span className="text-small text-ink-3">{n}</span>
              <p className={cls}>{t}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Spacing and radius">
        <div className="flex flex-wrap items-end gap-3">
          {SPACE.map((s) => (
            <div key={s} className="text-center">
              <div className="bg-action" style={{ width: s, height: s }} />
              <p className="tabular mt-1 text-tiny text-ink-3">{s}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          {[["rounded-chip", "4 chip"], ["rounded-control", "10 control"], ["rounded-panel", "16 panel"]].map(([r, l]) => (
            <div key={r} className="text-center">
              <div className={`size-20 border border-line bg-paper-2 ${r}`} />
              <p className="mt-1 text-tiny text-ink-3">{l}</p>
            </div>
          ))}
          <div className="text-center">
            <div className="size-20 rounded-panel bg-paper shadow-float" />
            <p className="mt-1 text-tiny text-ink-3">elevation 1</p>
          </div>
        </div>
      </Block>

      <Block title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Upload your resume</Button>
          <Button variant="secondary">See a sample alert</Button>
          <Button variant="text">Edit skills</Button>
          <Button variant="danger">Cancel subscription</Button>
          <Button loading>Tailor resume</Button>
          <Button disabled>Email HR</Button>
          <ButtonLink href="#" size="sm">Small link</ButtonLink>
        </div>
      </Block>

      <Block title="Highlighter, chips, badges, match score">
        <div className="flex flex-wrap items-center gap-3">
          <Highlighter>React</Highlighter>
          <SkillChip name="REST APIs" matched />
          <SkillChip name="TypeScript" />
          <Badge>Fresher-friendly</Badge>
          <Badge tone="success">Applied</Badge>
          <Badge tone="warning">Payment pending</Badge>
          <MatchScore score={87} reasons={{ matched_skills: ["React", "Git", "REST APIs", "HTML"], missing_skills: ["TypeScript"], fresher_friendly: true, location_fit: 1 }} city="Bengaluru" />
          <MatchScore score={72} />
        </div>
      </Block>

      <Block title="Job card">
        <div className="panel px-5">
          {JOBS.map((j) => (
            <JobCard
              key={j.id}
              job={j}
              score={j.id === "1" ? 87 : 68}
              mySkills={["React", "Git", "REST APIs", "SQL", "Python"]}
              href="#"
              actions={<><Button size="sm">Tailor resume</Button><Button size="sm" variant="secondary">Email HR</Button></>}
            />
          ))}
        </div>
      </Block>

      <Block title="Telegram alert preview">
        <TelegramAlertPreview />
      </Block>

      <Block title="Resume diff">
        <ResumeDiff lines={SAMPLE_DIFF} />
      </Block>

      <Block title="Pricing block">
        <PricingBlock freeAction={<Button variant="secondary" className="w-full">Stay on free plan</Button>} />
      </Block>

      <Block title="Tracker">
        <Tracker
          items={[
            { jobId: "1", title: "Frontend Developer Intern", company: "Zepto", stage: "saved", updatedAt: new Date().toISOString() },
            { jobId: "2", title: "Data Analyst – Fresher", company: "Swiggy", stage: "applied", updatedAt: new Date().toISOString() },
            { jobId: "3", title: "Junior React Developer", company: "Razorpay", stage: "interview", updatedAt: new Date().toISOString() },
          ]}
        />
      </Block>

      <Block title="Toast and empty state">
        <ToastDemo />
        <div className="mt-6">
          <EmptyState text="No matches yet. Add 3 more skills to widen your results." action={<ButtonLink href="#" variant="secondary">Edit skills</ButtonLink>} />
        </div>
      </Block>
    </main>
  );
}
