import Link from "next/link";

/** "GeeksFinder" in Schibsted Grotesk 700 with a highlighter stroke under "Finder". */
export function Wordmark({ href = "/", className = "" }: { href?: string; className?: string }) {
  return (
    <Link href={href} aria-label="GeeksFinder home" className={`isolate inline-flex min-h-11 items-center text-h3 font-bold tracking-[-0.02em] text-ink ${className}`}>
      Geeks
      <span className="relative">
        Finder
        <span aria-hidden className="absolute inset-x-0 -bottom-0.5 -z-10 h-2 -skew-x-6 rounded-chip bg-highlight" />
      </span>
    </Link>
  );
}
