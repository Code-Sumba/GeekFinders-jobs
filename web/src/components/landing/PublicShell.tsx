import { Navbar } from "./Navbar";
import { SiteFooter } from "./SiteFooter";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
