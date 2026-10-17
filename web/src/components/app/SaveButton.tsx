"use client";

import { Bookmark, Check } from "lucide-react";
import { useState, useTransition } from "react";
import { setStage } from "@/app/(app)/tracker/actions";
import { useToast } from "@/components/ui/Toast";

/** Icon button; morphs to a check on save (180 ms). */
export function SaveButton({ jobId, initiallySaved = false }: { jobId: string; initiallySaved?: boolean }) {
  const [saved, setSaved] = useState(initiallySaved);
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <button
      type="button"
      disabled={saved || pending}
      aria-label={saved ? "Saved to tracker" : "Save job"}
      onClick={() =>
        start(async () => {
          try {
            await setStage(jobId, "saved", true);
            setSaved(true);
            toast("Job saved");
          } catch {
            toast("Couldn't save. Try again.", "error");
          }
        })
      }
      className="grid size-11 place-items-center rounded-control border border-line text-ink-2 transition-colors duration-[180ms] hover:border-ink-3 hover:text-ink disabled:opacity-100"
    >
      <span className="relative size-5">
        <Bookmark size={20} strokeWidth={1.5} aria-hidden className={`absolute inset-0 transition-[opacity,transform] duration-[180ms] ${saved ? "scale-50 opacity-0" : "opacity-100"}`} />
        <Check size={20} strokeWidth={2} aria-hidden className={`absolute inset-0 text-success transition-[opacity,transform] duration-[180ms] ${saved ? "opacity-100" : "scale-50 opacity-0"}`} />
      </span>
    </button>
  );
}
