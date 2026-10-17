import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/app/AppNav";
import { ToastProvider } from "@/components/ui/Toast";
import { planName } from "@/lib/pricing";
import { requireUser } from "@/lib/supabase/server";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser();
  if (!user) redirect("/login");
  const [{ data: u }, { data: sub }] = await Promise.all([
    supabase.from("users").select("plan, role").eq("id", user.id).single(),
    supabase.from("subscriptions").select("plan_code").eq("user_id", user.id).maybeSingle(),
  ]);

  return (
    <ToastProvider>
      <AppNav planLabel={planName((u?.plan ?? "free") as "free" | "pro", sub?.plan_code)} isAdmin={u?.role === "admin"} />
      <div className="min-h-screen pb-20 md:pb-0 md:pl-60">
        <main className="mx-auto max-w-[60rem] px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </ToastProvider>
  );
}
