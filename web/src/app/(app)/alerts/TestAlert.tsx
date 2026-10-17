"use client";

import { Mail, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

/** First-day only: send yourself a real-format alert to see how matches arrive. */
export function TestAlert({ telegramConnected, email }: { telegramConnected: boolean; email: string }) {
  const [busy, setBusy] = useState<"telegram" | "email" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const toast = useToast();

  async function send(channel: "telegram" | "email") {
    setBusy(channel);
    setErr(null);
    const res = await fetch("/api/alerts/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channel }) });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return setErr(res.status === 429 ? "You've sent 3 test alerts today. Your real alerts arrive at your alert time." : (data.error ?? "The test alert didn't send. Try again in a minute."));
    toast(channel === "telegram" ? "Test alert sent to Telegram" : "Test alert sent to your email");
  }

  return (
    <section aria-labelledby="test-alert" className="mb-6 rounded-panel bg-paper-2 p-5 md:p-6">
      <h2 id="test-alert" className="text-h3 font-semibold">See what an alert looks like</h2>
      <p className="mt-1 max-w-[60ch] text-body text-ink-2">
        Send yourself a test with your top matches, exactly as it will arrive. Available on your first day, up to 3 times.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button variant="secondary" loading={busy === "telegram"} disabled={!telegramConnected || busy !== null} onClick={() => send("telegram")}>
          <Send size={16} strokeWidth={1.5} aria-hidden /> Send test to Telegram
        </Button>
        <Button variant="secondary" loading={busy === "email"} disabled={busy !== null} onClick={() => send("email")}>
          <Mail size={16} strokeWidth={1.5} aria-hidden /> Send test email
        </Button>
      </div>
      <p className="mt-3 text-small text-ink-2">
        {telegramConnected ? (
          <>Email goes to <span className="font-medium text-ink">{email}</span>.</>
        ) : (
          <>Connect Telegram below to test it. Email goes to <span className="font-medium text-ink">{email}</span>.</>
        )}
      </p>
      {err && (
        <p className="mt-3 text-small text-danger" role="alert">
          {err}
          {/Connect Telegram/.test(err) && <> <Link href="#alerts-form" className="text-action underline-offset-4 hover:underline">Connect now</Link></>}
        </p>
      )}
    </section>
  );
}
