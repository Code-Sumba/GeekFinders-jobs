import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/LegalPage";
import { OptOutForm } from "./OptOutForm";

export const metadata: Metadata = {
  title: "Recruiters: stop student emails",
  description: "Recruiters and HR teams can ask GeeksFinder to never show their email address to students.",
  alternates: { canonical: "/hr-opt-out" },
};

export default function HrOptOut() {
  return (
    <LegalPage title="For recruiters: stop student emails">
      <p>
        GeeksFinder helps final-year students write a short, personal email to the hiring team for a job they&apos;re applying to. Students send these
        emails themselves, from their own inbox, and we limit each student to 15 a day.
      </p>
      <p>If you&apos;d rather not receive them, enter your work email. We&apos;ll stop showing it to every student straight away. We never sell or share contact lists.</p>
      <OptOutForm />
    </LegalPage>
  );
}
