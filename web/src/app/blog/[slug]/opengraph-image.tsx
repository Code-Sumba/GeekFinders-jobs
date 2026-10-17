import { ogCard, OG_SIZE } from "@/lib/og";
import { publicClient } from "@/lib/public-data";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "GeeksFinder article";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = (await publicClient()?.from("articles").select("title, topic").eq("slug", slug).maybeSingle()) ?? { data: null };
  return ogCard({ eyebrow: data?.topic ?? "GeeksFinder Blog", title: data?.title ?? "Hiring news for freshers" });
}
