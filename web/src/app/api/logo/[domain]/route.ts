import { isLogoDomain } from "@/lib/company";

/**
 * Company logo by domain, proxied so students' browsers only talk to us (no third-party tracking)
 * and logos are cached at the edge. The upstream host is fixed; only a validated domain is passed on.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const d = decodeURIComponent(domain).toLowerCase();
  if (!isLogoDomain(d)) return new Response(null, { status: 400 });

  const res = await fetch(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=128`, {
    signal: AbortSignal.timeout(5000),
    next: { revalidate: 604_800 },
  }).catch(() => null);
  const type = res?.headers.get("content-type") ?? "";
  // Upstream answers 404 (with a generic globe) when it has no logo; the page then shows the company initial
  if (!res?.ok || !type.startsWith("image/")) return new Response(null, { status: 404, headers: { "Cache-Control": "public, max-age=86400" } });
  const body = await res.arrayBuffer();
  if (body.byteLength > 200_000) return new Response(null, { status: 404 });

  return new Response(body, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=604800, stale-while-revalidate=2592000",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
