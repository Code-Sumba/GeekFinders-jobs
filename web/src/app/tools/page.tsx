import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/landing/PublicShell";

export const metadata: Metadata = {
  title: "Free resume and job tools for freshers",
  description: "Free ATS resume checker and HR email generator for final-year students. No login needed.",
  alternates: { canonical: "/tools" },
};

const TOOLS = [
  { href: "/tools/ats-resume-checker", title: "ATS resume checker", body: "Paste your resume and a job description. See which asked skills you have, which are missing, and what ATS software will trip on." },
  { href: "/tools/hr-email-generator", title: "HR email generator", body: "Write a short, personal email to a recruiter in plain Indian English — under 150 words, with a LinkedIn note." },
];

export default function Tools() {
  return (
    <PublicShell>
      <div className="wrap max-w-[50rem] pb-24 pt-10 md:pt-16">
        <h1 className="text-h1 font-bold md:text-h1-lg">Free tools</h1>
        <p className="mt-2 text-body text-ink-2">No login needed.</p>
        <ul className="mt-8">
          {TOOLS.map((t) => (
            <li key={t.href} className="border-b border-line py-6">
              <h2 className="text-h3 font-semibold"><Link href={t.href} className="underline-offset-4 hover:underline">{t.title}</Link></h2>
              <p className="mt-1 max-w-[65ch] text-body text-ink-2">{t.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </PublicShell>
  );
}
