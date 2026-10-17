import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/LegalPage";
import { Button } from "@/components/ui/Button";
import { verifyUnsubscribe } from "@/lib/unsubscribe";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };

/** Confirm step (a GET never unsubscribes, so email link scanners can't trigger it). */
export default async function Unsubscribe({ searchParams }: { searchParams: Promise<{ u?: string; t?: string; done?: string }> }) {
  const { u = "", t = "", done } = await searchParams;

  if (done)
    return (
      <LegalPage title="You're unsubscribed">
        <p>We won&apos;t send job digests to your email any more. Telegram alerts, if you connected them, keep working.</p>
        <p>Changed your mind? Turn email back on from <Link href="/alerts">Alerts</Link>.</p>
      </LegalPage>
    );

  if (!verifyUnsubscribe(u, t))
    return (
      <LegalPage title="This link isn't valid">
        <p>Open the latest GeeksFinder email and use its unsubscribe link, or change your email settings from <Link href="/alerts">Alerts</Link>.</p>
      </LegalPage>
    );

  return (
    <LegalPage title="Stop job emails?">
      <p>You&apos;ll stop getting GeeksFinder job digests by email. Your account, matches and Telegram alerts stay as they are.</p>
      <form action={`/api/unsubscribe`} method="post" className="mt-6">
        <input type="hidden" name="u" value={u} />
        <input type="hidden" name="t" value={t} />
        <input type="hidden" name="from" value="page" />
        <Button type="submit">Unsubscribe from emails</Button>
      </form>
    </LegalPage>
  );
}
