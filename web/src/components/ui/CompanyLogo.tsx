"use client";

import { useState } from "react";
import { cleanCompany, logoDomain } from "@/lib/company";

/** Company logo in a bordered tile; falls back to the company's initial (DESIGN.md JobCard tile) if there's no logo. */
export function CompanyLogo({ company, domain, size = "md" }: { company: string; domain?: string | null; size?: "md" | "lg" }) {
  const d = logoDomain(company, domain);
  const [failed, setFailed] = useState(false);
  const box = size === "lg" ? "size-12 text-h3" : "size-10 text-body";
  const img = size === "lg" ? "size-8" : "size-6";

  if (!d || failed)
    return (
      <div aria-hidden className={`grid shrink-0 place-items-center rounded-control bg-paper-2 font-semibold text-ink-2 ${box}`}>
        {cleanCompany(company).charAt(0).toUpperCase()}
      </div>
    );
  return (
    <div aria-hidden className={`grid shrink-0 place-items-center rounded-control border border-line bg-paper ${box}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny cached favicon; next/image adds nothing here */}
      <img src={`/api/logo/${d}`} alt="" width={32} height={32} loading="lazy" decoding="async" className={`${img} object-contain`} onError={() => setFailed(true)} />
    </div>
  );
}
