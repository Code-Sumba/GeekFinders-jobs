/** Pure helpers safe to import from client components. */

/** Open-redirect guard: only allow internal relative paths. */
export function safeNext(next: string | null | undefined, fallback = "/dashboard") {
  if (!next || typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\") || /[\r\n]/.test(next)) return fallback;
  try {
    const u = new URL(next, "http://x");
    return u.host === "x" ? u.pathname + u.search : fallback;
  } catch {
    return fallback;
  }
}
