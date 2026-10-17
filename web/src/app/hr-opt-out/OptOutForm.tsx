"use client";

import { useState } from "react";
import { Turnstile } from "@/components/app/Turnstile";
import { Button } from "@/components/ui/Button";

export function OptOutForm() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch("/api/hr-opt-out", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, turnstile: token }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(data.error ?? "Something went wrong. Try again.");
    setDone(true);
  }

  if (done) return <p className="rounded-panel border border-success p-4 text-body text-success" role="status">Done. Students on GeeksFinder will no longer see {email}.</p>;

  return (
    <form onSubmit={submit} className="mt-2 max-w-sm space-y-4">
      <div>
        <label htmlFor="hr-email" className="label">Work email</label>
        <input id="hr-email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} aria-describedby={err ? "hr-err" : undefined} />
      </div>
      <Turnstile onToken={setToken} />
      <Button type="submit" loading={busy} disabled={!email}>Stop student emails</Button>
      {err && <p id="hr-err" className="text-small text-danger" role="alert">{err}</p>}
    </form>
  );
}
