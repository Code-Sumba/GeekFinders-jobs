import { describe, expect, it } from "vitest";
import { formatJobDescription } from "@/lib/jobtext";

describe("job description formatting", () => {
  it("splits flattened text on headings and into short paragraphs", () => {
    const flat =
      "We build data tools. You will help customers. About MongoDB MongoDB is built for change. It powers apps. Teams love it. It scales well. Responsibilities • Design APIs • Write tests • Review code Requirements Java and SQL.";
    const b = formatJobDescription(flat);
    expect(b.filter((x) => x.kind === "heading").map((x) => (x as { text: string }).text)).toEqual(["About MongoDB", "Responsibilities", "Requirements"]);
    expect(b.find((x) => x.kind === "list")).toEqual({ kind: "list", items: ["Design APIs", "Write tests", "Review code"] });
  });

  it("keeps structure from text with line breaks", () => {
    const b = formatJobDescription("What you'll do\n• Build React screens\n• Fix bugs\n\nWe are a small team in Pune that ships every week.");
    expect(b[0]).toEqual({ kind: "heading", text: "What you'll do" });
    expect(b[1]).toEqual({ kind: "list", items: ["Build React screens", "Fix bugs"] });
    expect(b[2].kind).toBe("para");
  });

  it("handles empty input", () => {
    expect(formatJobDescription(null)).toEqual([]);
  });
});

describe("years of experience asked", () => {
  it("finds the minimum years in common phrasings", async () => {
    const { minYearsAsked } = await import("@/lib/jobtext");
    expect(minYearsAsked("4-7 years of experience in software development")).toBe(4);
    expect(minYearsAsked("You have 3+ years of professional experience")).toBe(3);
    expect(minYearsAsked("Minimum 2 years in a backend role")).toBe(2);
    expect(minYearsAsked("0-1 years experience. Freshers welcome")).toBe(0);
    expect(minYearsAsked("We hire final-year students")).toBeNull();
  });
});
