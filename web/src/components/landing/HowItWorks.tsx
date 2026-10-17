"use client";

import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SkillChip } from "@/components/ui/Highlighter";
import { JobCard } from "@/components/ui/JobCard";
import { TelegramAlertPreview } from "@/components/ui/TelegramAlertPreview";

const STEPS = [
  { title: "Upload your resume", body: "We read your skills, projects and education in seconds." },
  { title: "Get matched jobs", body: "New jobs from LinkedIn, company career pages and job boards, scored against your skills." },
  { title: "Apply properly", body: "Tailor your resume to each job and send HR a personal email." },
];

const SAMPLE_JOB = {
  id: "sample",
  title: "Frontend Developer Intern",
  company: "Zepto",
  location: "Bengaluru",
  remote: false,
  fresher_friendly: true,
  skills: ["React", "TypeScript", "Git", "REST APIs"],
  posted_at: null,
};

function Visual({ step }: { step: number }) {
  if (step === 0)
    return (
      <div className="panel p-6">
        <p className="text-small font-medium text-ink-2">Skills found on your resume</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Python", "React", "SQL", "Git", "REST APIs", "Tailwind CSS"].map((s) => <SkillChip key={s} name={s} />)}
        </div>
        <p className="mt-5 text-small font-medium text-ink-2">Education</p>
        <p className="text-body">B.Tech Computer Science · Kolhapur · Class of 2026</p>
      </div>
    );
  if (step === 1)
    return (
      <div className="panel px-5">
        <JobCard job={SAMPLE_JOB} score={87} mySkills={["React", "Git", "REST APIs"]} reasons={{ matched_skills: ["React", "Git", "REST APIs"], missing_skills: ["TypeScript"], fresher_friendly: true, location_fit: 1 }} />
      </div>
    );
  return <TelegramAlertPreview className="mx-auto" />;
}

/** Sticky section: text scrolls on the left, the visual crossfades between 3 steps. */
export function HowItWorks() {
  const [step, setStep] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const reduce = useReducedMotion();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setStep(Number((e.target as HTMLElement).dataset.step))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <div className="grid gap-10 md:grid-cols-12">
        <ol className="md:col-span-5">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              ref={(el) => { refs.current[i] = el; }}
              data-step={i}
              className={`py-8 transition-colors duration-[280ms] md:flex md:min-h-[45vh] md:flex-col md:justify-center ${step === i ? "text-ink" : "md:text-ink-3"}`}
            >
              <p className="tabular text-small font-semibold text-action">Step {i + 1}</p>
              <h3 className="mt-1 text-h2 font-semibold md:text-h2-lg">{s.title}</h3>
              <p className="mt-2 max-w-[42ch] text-body text-ink-2">{s.body}</p>
              <div className="mt-6 md:hidden"><Visual step={i} /></div>
            </li>
          ))}
        </ol>
        <div className="hidden md:col-span-7 md:block">
          <div className="sticky top-24 flex min-h-[45vh] items-center">
            <AnimatePresence mode="wait">
              <m.div
                key={step}
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0.12 : 0.28, ease: [0.2, 0, 0, 1] }}
              >
                <Visual step={step} />
              </m.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}
