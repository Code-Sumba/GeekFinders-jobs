"use client";

import { Bell, CreditCard, FileText, KanbanSquare, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/ui/Wordmark";

const TABS = [
  { href: "/dashboard", label: "Matches", icon: Sparkles },
  { href: "/tracker", label: "Tracker", icon: KanbanSquare },
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

export function AppNav({ planLabel, isAdmin }: { planLabel: string; isAdmin?: boolean }) {
  const path = usePathname();
  const active = (href: string) => path === href || path.startsWith(`${href}/`) || (href === "/dashboard" && path.startsWith("/apply"));

  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-line bg-paper px-4 py-5 md:flex">
        <Wordmark href="/dashboard" className="px-2" />
        <nav aria-label="App" className="mt-8 flex flex-col gap-1">
          {TABS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={active(href) ? "page" : undefined}
              className={`flex h-11 items-center gap-3 rounded-control px-3 text-body transition-colors duration-[180ms] ${active(href) ? "bg-paper-2 font-semibold text-ink" : "text-ink-2 hover:text-ink"}`}
            >
              <Icon size={20} strokeWidth={1.5} aria-hidden />
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className="mt-4 flex h-11 items-center rounded-control px-3 text-small text-ink-3 hover:text-ink">
              Admin
            </Link>
          )}
        </nav>
        <div className="mt-auto space-y-2 px-2">
          <p className="text-small text-ink-2">
            Plan: <span className="font-semibold text-ink">{planLabel}</span>
          </p>
          <form action="/auth/signout" method="post">
            <button className="min-h-11 text-small text-action underline-offset-4 hover:underline">Sign out</button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-paper px-4 md:hidden">
        <Wordmark href="/dashboard" />
        <form action="/auth/signout" method="post">
          <button className="min-h-11 text-small text-action">Sign out</button>
        </form>
      </header>

      <nav aria-label="App" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] md:hidden">
        {TABS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={active(href) ? "page" : undefined}
            className={`flex h-16 flex-col items-center justify-center gap-1 text-tiny ${active(href) ? "font-semibold text-action" : "text-ink-2"}`}
          >
            <Icon size={20} strokeWidth={1.5} aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
