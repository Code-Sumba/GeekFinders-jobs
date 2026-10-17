import { ogCard, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "GeeksFinder — wake up to jobs that fit your resume";

export default function Image() {
  return ogCard({ eyebrow: "For final-year students and freshers", title: "Wake up to jobs that fit your resume.", footer: "Matched jobs on Telegram · Tailor your resume · Email HR" });
}
