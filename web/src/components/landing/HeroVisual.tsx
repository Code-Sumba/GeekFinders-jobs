"use client";

import { useEffect, useRef, useState } from "react";
import { TelegramAlertPreview } from "@/components/ui/TelegramAlertPreview";

const SWEEP_DELAYS = [400, 970, 1540]; // 450 ms each, 120 ms stagger

function Sweep({ children, i }: { children: string; i: number }) {
  return (
    <span className="hero-sweep" style={{ "--d": `${SWEEP_DELAYS[i]}ms` } as React.CSSProperties}>
      {children}
    </span>
  );
}

/**
 * Hero sequence (DESIGN.md §5), ~4 s, runs once then rests on the final frame:
 * 0.4 s highlighter sweeps React, REST APIs, Git → 1.8 s score counts 0→87 → 2.6 s alert rises into the phone
 * → 3.4 s one pulse on "Tailor resume". CSS keyframes + one rAF counter (tiny JS). Reduced motion = final frame.
 */
export function HeroVisual() {
  const [run, setRun] = useState(0);
  const [score, setScore] = useState(87);
  const raf = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setScore(87);
    setScore(0);
    const start = performance.now() + 1800;
    const tick = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - start) / 600));
      setScore(Math.round(87 * (1 - (1 - p) ** 3)));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [run]);

  return (
    <div>
      <div key={run} className="relative flex flex-col lg:flex-row lg:items-start">
        <div className="panel relative z-0 p-5 sm:p-6 lg:w-[22rem] lg:shrink-0" aria-label="Sample job description">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-h3 font-semibold">Frontend Developer Intern</p>
              <p className="text-small text-ink-3">Zepto · Bengaluru · 2 h ago</p>
            </div>
            <span className="tabular shrink-0 text-h3 font-semibold text-success" aria-label="87% match">
              {score}%
            </span>
          </div>
          <p className="mt-4 text-small text-ink-2">
            You&apos;ll build customer-facing screens in <Sweep i={0}>React</Sweep> and TypeScript, integrate <Sweep i={1}>REST APIs</Sweep> with our backend
            team, and ship through code review on <Sweep i={2}>Git</Sweep>. Final-year students and 2026 graduates welcome.
          </p>
          <p className="mt-3 text-tiny text-ink-3">Highlighted: skills already on Priya&apos;s resume</p>
        </div>
        <div className="hero-rise relative z-10 mt-4 ml-auto mr-2 w-fit lg:-ml-8 lg:mr-0 lg:mt-24">
          <TelegramAlertPreview pulseClassName="hero-pulse" />
        </div>
      </div>
      <button type="button" onClick={() => setRun((r) => r + 1)} className="mt-2 min-h-11 text-small text-action underline-offset-4 hover:underline motion-reduce:hidden">
        Replay
      </button>
    </div>
  );
}
