"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";

const LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/#faq", label: "FAQ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`sticky top-0 z-40 bg-paper transition-colors duration-[180ms] ${scrolled || open ? "border-b border-line" : "border-b border-transparent"}`}>
      <div className="wrap flex h-16 items-center gap-3 md:gap-6">
        <Wordmark />
        <nav aria-label="Main" className="hidden gap-1 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-chip px-3 py-2 text-small text-ink-2 hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link href="/login" className="hidden min-h-11 items-center px-3 text-small font-medium text-action underline-offset-4 hover:underline md:inline-flex">
            Log in
          </Link>
          <ButtonLink href="/login?next=/onboarding" size="sm">
            <span className="sm:hidden">Upload resume</span>
            <span className="hidden sm:inline">Upload your resume</span>
          </ButtonLink>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="-mr-2 grid size-11 shrink-0 place-items-center rounded-control text-ink md:hidden"
          >
            {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="wrap flex flex-col pb-4 md:hidden">
          {[...LINKS, { href: "/login", label: "Log in" }].map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="flex min-h-11 items-center border-b border-line text-body text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
