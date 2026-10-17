"use client";

import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

type Toast = { id: number; text: string; tone: "success" | "error" };
const Ctx = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});

export const useToast = () => useContext(Ctx);

/** Bottom-centre on mobile, bottom-right on desktop, auto-dismiss 4 s. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <Ctx.Provider value={push}>
      {children}
      <LazyMotion features={domAnimation}>
        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6 md:right-6 md:left-auto md:items-end"
        >
          <AnimatePresence>
            {toasts.map((t) => (
              <m.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="pointer-events-auto flex items-center gap-2 rounded-control border border-line bg-paper px-4 py-3 text-small font-medium shadow-float"
              >
                {t.tone === "success" ? (
                  <CircleCheck size={20} strokeWidth={1.5} className="text-success" aria-hidden />
                ) : (
                  <CircleAlert size={20} strokeWidth={1.5} className="text-danger" aria-hidden />
                )}
                {t.text}
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      </LazyMotion>
    </Ctx.Provider>
  );
}

export function EmptyState({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-panel border border-dashed border-line px-6 py-12 text-center">
      <p className="mx-auto mb-4 max-w-md text-body text-ink-2">{text}</p>
      {action}
    </div>
  );
}
