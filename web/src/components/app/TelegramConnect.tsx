"use client";

import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { disconnectTelegram, telegramConnectLink, telegramStatus } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

/** "Connect Telegram" opens the bot deep link; the page waits with a live status chip (grey → green with a check). */
export function TelegramConnect({ connected: initial, primary = true }: { connected: boolean; primary?: boolean }) {
  const [connected, setConnected] = useState(initial);
  const [waiting, setWaiting] = useState(false);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const toast = useToast();

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  async function connect() {
    setBusy(true);
    // Open the tab synchronously so mobile browsers don't block the popup
    const tab = window.open("about:blank", "_blank");
    try {
      const link = await telegramConnectLink();
      if (tab) tab.location.href = link;
      else window.location.href = link;
      setWaiting(true);
      let tries = 0;
      timer.current = setInterval(async () => {
        tries++;
        if (await telegramStatus()) {
          setConnected(true);
          setWaiting(false);
          toast("Telegram connected");
          if (timer.current) clearInterval(timer.current);
        } else if (tries > 100) {
          setWaiting(false);
          if (timer.current) clearInterval(timer.current);
        }
      }, 3000);
    } catch {
      tab?.close();
      toast("Couldn't create the link. Try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span
        role="status"
        className={`inline-flex h-8 items-center gap-1.5 rounded-chip border px-2.5 text-small font-medium transition-colors duration-[180ms] ${connected ? "border-success text-success" : "border-line text-ink-2"}`}
      >
        {connected ? <Check size={16} strokeWidth={2} aria-hidden /> : <span aria-hidden className={`size-2 rounded-full bg-ink-3 ${waiting ? "animate-pulse" : ""}`} />}
        {connected ? "Connected" : waiting ? "Waiting for you to press Start in Telegram" : "Not connected"}
      </span>
      {connected ? (
        <Button variant="text" onClick={async () => { await disconnectTelegram(); setConnected(false); }}>Disconnect</Button>
      ) : (
        <Button variant={primary ? "primary" : "secondary"} onClick={connect} loading={busy}>
          {waiting ? "Open Telegram again" : "Connect Telegram"}
        </Button>
      )}
    </div>
  );
}
