import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk, Source_Serif_4 } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const sans = Schibsted_Grotesk({ variable: "--font-schibsted", subsets: ["latin"], display: "swap" });
const serif = Source_Serif_4({ variable: "--font-source-serif", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "GeeksFinder — Fresher jobs matched to your resume", template: "%s – GeeksFinder" },
  description: SITE.description,
  applicationName: "GeeksFinder",
  openGraph: { siteName: "GeeksFinder", type: "website", locale: "en_IN" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // Browser extensions (QuillBot, Grammarly…) add attributes to <html> before React loads; ignore only those, on this one tag
    <html lang="en-IN" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
