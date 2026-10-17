import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";
import { requireAdmin } from "@/lib/admin";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

/** Server-side role check on every admin request; non-admins get a 404. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div>
      <header className="border-b border-line">
        <div className="wrap flex h-16 items-center gap-6">
          <Wordmark href="/dashboard" />
          <nav className="flex gap-4 text-small">
            <Link href="/admin" className="text-ink-2 hover:text-ink">Overview</Link>
            <Link href="/admin/drafts" className="text-ink-2 hover:text-ink">Review queue</Link>
            <Link href="/admin/contacts" className="text-ink-2 hover:text-ink">HR contacts</Link>
          </nav>
        </div>
      </header>
      <main className="wrap py-8">{children}</main>
    </div>
  );
}
