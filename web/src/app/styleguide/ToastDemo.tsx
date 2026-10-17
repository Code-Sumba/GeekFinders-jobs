"use client";

import { Button } from "@/components/ui/Button";
import { ToastProvider, useToast } from "@/components/ui/Toast";

function Inner() {
  const toast = useToast();
  return (
    <div className="flex gap-3">
      <Button variant="secondary" onClick={() => toast("Resume tailored")}>Show success toast</Button>
      <Button variant="secondary" onClick={() => toast("This PDF has no readable text. Upload a text-based PDF.", "error")}>Show error toast</Button>
    </div>
  );
}

export function ToastDemo() {
  return (
    <ToastProvider>
      <Inner />
    </ToastProvider>
  );
}
