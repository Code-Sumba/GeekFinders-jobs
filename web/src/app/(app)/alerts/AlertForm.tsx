"use client";

import { useState, useTransition } from "react";
import { saveAlerts } from "@/app/onboarding/actions";
import { AlertFields, type AlertValues } from "@/components/app/AlertFields";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function AlertForm({ initial, plan, telegramConnected }: { initial: AlertValues; plan: "free" | "pro"; telegramConnected: boolean }) {
  const [v, setV] = useState(initial);
  const [pending, start] = useTransition();
  const toast = useToast();

  return (
    <div className="panel p-5 md:p-6">
      <AlertFields value={v} onChange={setV} plan={plan} telegramConnected={telegramConnected} showQuiet />
      <Button
        className="mt-8"
        loading={pending}
        disabled={!v.channels.length}
        onClick={() =>
          start(async () => {
            const r = await saveAlerts({ frequency: v.frequency as "daily", channels: v.channels as "telegram"[], alert_hour: v.alertHour, quiet_start: v.quietStart, quiet_end: v.quietEnd });
            toast(r.ok ? "Alerts saved" : r.error, r.ok ? "success" : "error");
          })
        }
      >
        Save alerts
      </Button>
    </div>
  );
}
