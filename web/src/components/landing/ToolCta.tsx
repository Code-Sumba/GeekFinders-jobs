import { ButtonLink } from "@/components/ui/Button";

export function ToolCta() {
  return (
    <section className="mt-16 rounded-panel bg-paper-2 p-6 md:p-8">
      <h2 className="text-h2 font-semibold">Get matches like this every morning</h2>
      <p className="mt-2 max-w-[60ch] text-body text-ink-2">Upload your resume once. We send fresher jobs that fit your skills to Telegram, and tailor your resume to each one in a click.</p>
      <ButtonLink href="/login?next=/onboarding" className="mt-5">Upload your resume</ButtonLink>
    </section>
  );
}
