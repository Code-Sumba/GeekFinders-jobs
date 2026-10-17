"use client";

import { Check, MapPin, Search, SlidersHorizontal, Wrench, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

export type Filters = {
  view?: string;
  role?: string;
  city?: string;
  remote?: string;
  fresher?: string;
  intern?: string;
  posted?: string;
  min?: string;
  skill?: string;
  sort?: string;
};

type Option = { name: string; count: number };

const select = "h-11 rounded-control border border-line bg-paper-2 px-3 text-small text-ink outline-none transition-colors duration-[180ms] focus:border-action focus:bg-paper";

/**
 * GET form. Chips and dropdowns apply as soon as they change. Role, skill and city are search boxes with
 * suggestions from every live job (native datalist: type to narrow, works with keyboard and screen readers);
 * they apply when a suggestion is picked, on Enter, or when the box loses focus.
 */
export function FilterBar({ f, roles, skills, cities, count, total }: { f: Filters; roles: Option[]; skills: Option[]; cities: Option[]; count: number; total?: number }) {
  const form = useRef<HTMLFormElement>(null);
  const apply = () => form.current?.requestSubmit();
  const active = Object.entries(f).filter(([k, v]) => v && k !== "sort" && k !== "view").length;
  const dropdowns = [f.posted, f.min].filter(Boolean).length;
  // Phones: the dropdowns sit behind "More filters" so jobs show above the fold; always visible from md
  const [more, setMore] = useState(dropdowns > 0);
  const clearHref = `/dashboard?view=${f.view === "all" ? "all" : "matches"}`;

  const chip = (name: keyof Filters, label: string) => {
    const on = !!f[name];
    return (
      <label
        className={`inline-flex h-9 cursor-pointer select-none items-center gap-1.5 rounded-control border px-3 text-small font-medium transition-colors duration-[180ms] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action ${on ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink-3"}`}
      >
        <input type="checkbox" name={name} value="1" defaultChecked={on} onChange={apply} className="sr-only" />
        {on && <Check size={16} strokeWidth={2} aria-hidden />}
        {label}
      </label>
    );
  };

  const searchBox = (name: "role" | "skill" | "city", label: string, placeholder: string, Icon: typeof Search, options: Option[]) => {
    const names = new Set(options.map((o) => o.name.toLowerCase()));
    return (
      <div className="relative">
        <label htmlFor={`f-${name}`} className="sr-only">{label}</label>
        <Icon size={16} strokeWidth={1.5} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
        <input
          id={`f-${name}`}
          name={name}
          type="search"
          list={`l-${name}`}
          autoComplete="off"
          maxLength={60}
          defaultValue={f[name]}
          placeholder={placeholder}
          className="input pl-9"
          // Picking a suggestion fills the exact value: apply straight away
          onInput={(e) => names.has(e.currentTarget.value.toLowerCase()) && apply()}
          onBlur={(e) => e.currentTarget.value !== (f[name] ?? "") && apply()}
        />
        <datalist id={`l-${name}`}>
          {options.map((o) => (
            <option key={o.name} value={o.name} label={o.count ? `${o.count} ${o.count === 1 ? "job" : "jobs"}` : undefined} />
          ))}
        </datalist>
      </div>
    );
  };

  return (
    <form ref={form} className="mt-6 space-y-3" role="search" aria-label="Filter jobs">
      <input type="hidden" name="view" value={f.view === "all" ? "all" : "matches"} />
      <div className="flex flex-wrap gap-2">
        {chip("fresher", "Fresher-friendly")}
        {chip("intern", "Internships")}
        {chip("remote", "Remote")}
        <button
          type="button"
          aria-expanded={more}
          aria-controls="more-filters"
          onClick={() => setMore((m) => !m)}
          className="inline-flex h-9 items-center gap-1.5 rounded-control border border-line px-3 text-small font-medium text-ink transition-colors duration-[180ms] hover:border-ink-3 md:hidden"
        >
          <SlidersHorizontal size={16} strokeWidth={1.5} aria-hidden />
          {more ? "Fewer filters" : `More filters${dropdowns ? ` (${dropdowns})` : ""}`}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        <div className="col-span-2 md:col-span-1">{searchBox("role", "Role", "Role, e.g. Developer", Search, roles)}</div>
        {searchBox("skill", "Skill", "Skill, e.g. Java", Wrench, skills)}
        {searchBox("city", "City", "City, e.g. Pune", MapPin, cities)}
      </div>

      <div id="more-filters" className={`grid-cols-2 gap-2 md:flex ${more ? "grid" : "hidden"}`}>
        <label className="sr-only" htmlFor="f-posted">Posted</label>
        <select id="f-posted" name="posted" defaultValue={f.posted ?? ""} onChange={apply} className={select}>
          <option value="">Posted any time</option>
          <option value="1">Last 24 hours</option>
          <option value="3">Last 3 days</option>
          <option value="7">Last 7 days</option>
        </select>
        <label className="sr-only" htmlFor="f-min">Match</label>
        <select id="f-min" name="min" defaultValue={f.min ?? ""} onChange={apply} className={select}>
          <option value="">Any match</option>
          <option value="60">60% match or more</option>
          <option value="70">70% match or more</option>
          <option value="80">80% match or more</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-small text-ink-2">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1" aria-live="polite">
          {total !== undefined && total > count ? (
            <span>
              Showing <span className="tabular font-semibold text-ink">{count}</span> of <span className="tabular">{total}</span> jobs · add a filter to narrow
            </span>
          ) : (
            <span>
              <span className="tabular font-semibold text-ink">{count}</span> {count === 1 ? "job" : "jobs"}
            </span>
          )}
          {active > 0 && (
            <Link href={clearHref} className="inline-flex items-center gap-1 text-action underline-offset-4 hover:underline">
              <X size={14} strokeWidth={2} aria-hidden /> Clear {active} {active === 1 ? "filter" : "filters"}
            </Link>
          )}
        </p>
        <label className="flex items-center gap-2">
          Sort
          <select name="sort" defaultValue={f.sort ?? ""} onChange={apply} className={`${select} h-9`}>
            <option value="">Best match first</option>
            <option value="new">Newest first</option>
          </select>
        </label>
        <button type="submit" className="sr-only">Apply filters</button>
      </div>
    </form>
  );
}
