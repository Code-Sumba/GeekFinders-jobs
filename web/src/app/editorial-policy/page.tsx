import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/LegalPage";

export const metadata: Metadata = {
  title: "Editorial policy",
  description: "How GeeksFinder writes news with AI, checks it automatically, and has a person review every article before it goes live.",
  alternates: { canonical: "/editorial-policy" },
};

export default function EditorialPolicy() {
  return (
    <LegalPage title="Editorial policy" updated="15 Oct 2026">
      <p>GeeksFinder publishes short news on hiring and tech careers for final-year students and freshers. Here is exactly how each article is made.</p>
      <h2>How an article is written</h2>
      <ol>
        <li>We collect news from Indian tech and business outlets, company newsrooms and news feeds.</li>
        <li>We only write about an event when at least two independent outlets have reported it.</li>
        <li>We extract the facts — who, what, numbers, dates — and keep a link to where each fact came from.</li>
        <li>An AI model (Claude, by Anthropic) writes the article from that fact list only. It never sees or rewrites a single source article.</li>
        <li>Automated checks reject drafts that copy 8 or more words in a row from any source, mention numbers or names not in the fact list, or use filler phrases.</li>
        <li>A person on our team reads every draft, checks it against the sources, edits it, and approves it. Nothing publishes automatically.</li>
      </ol>
      <h2>Bylines</h2>
      <p>Articles are credited to &quot;GeeksFinder Desk, reviewed by&quot; the person who approved it, with the date.</p>
      <h2>Sources and corrections</h2>
      <p>Every article lists and links its sources at the end. If we get something wrong, <Link href="/contact">tell us</Link>. We fix it and add a dated correction note to the article.</p>
      <h2>Independence</h2>
      <p>We don&apos;t accept payment for coverage. Job listings shown under articles are chosen by matching skills, not by payment.</p>
    </LegalPage>
  );
}
