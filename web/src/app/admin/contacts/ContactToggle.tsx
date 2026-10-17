"use client";

import { useState, useTransition } from "react";
import { setDoNotContact } from "./actions";

export function ContactToggle({ id, flagged: initial }: { id: string; flagged: boolean }) {
  const [flagged, setFlagged] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => { await setDoNotContact(id, !flagged); setFlagged(!flagged); })}
      className="min-h-11 text-small text-action underline-offset-4 hover:underline disabled:opacity-40"
    >
      {flagged ? "Allow again" : "Flag do-not-contact"}
    </button>
  );
}
