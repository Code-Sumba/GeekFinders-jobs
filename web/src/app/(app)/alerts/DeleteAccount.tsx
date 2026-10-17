"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function DeleteAccount() {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function del() {
    setBusy(true);
    const res = await fetch("/api/account/delete", { method: "POST" });
    setBusy(false);
    if (res.ok) location.href = "/";
    else setErr("Couldn't delete your account. Try again or email us.");
  }

  return (
    <section className="mt-12 border-t border-line pt-8">
      <h2 className="text-h3 font-semibold">Delete my account</h2>
      <p className="mt-1 max-w-[60ch] text-body text-ink-2">
        Removes your profile, resumes, matches, tracker and HR email history. Also cancel the Autopay mandate in your UPI app.
      </p>
      {confirming ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="danger" className="border-danger" loading={busy} onClick={del}>Yes, delete everything</Button>
          <Button variant="secondary" onClick={() => setConfirming(false)}>Keep my account</Button>
        </div>
      ) : (
        <Button variant="danger" className="mt-4" onClick={() => setConfirming(true)}>Delete account</Button>
      )}
      {err && <p className="mt-2 text-small text-danger" role="alert">{err}</p>}
    </section>
  );
}
