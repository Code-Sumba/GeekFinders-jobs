import { describe, expect, it } from "vitest";
import { isPdf, oneLine, redact, safeNext } from "@/lib/security";
import { isPrivateIp, assertPublicUrl } from "@/lib/safe-fetch";
import { memoryLimit } from "@/lib/ratelimit";

describe("open redirect guard", () => {
  it.each([
    ["https://evil.example", "/dashboard"],
    ["//evil.example", "/dashboard"],
    ["/\\evil.example", "/dashboard"],
    ["javascript:alert(1)", "/dashboard"],
    ["/billing?x=1", "/billing?x=1"],
    ["/onboarding", "/onboarding"],
    [null, "/dashboard"],
  ])("safeNext(%s) → %s", (input, out) => expect(safeNext(input)).toBe(out));
});

describe("upload type check", () => {
  it("accepts real PDF magic bytes", () => expect(isPdf(new TextEncoder().encode("%PDF-1.7\n..."))).toBe(true));
  it("rejects a renamed .exe", () => expect(isPdf(new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00]))).toBe(false));
  it("rejects empty files", () => expect(isPdf(new Uint8Array())).toBe(false));
});

describe("header injection + PII", () => {
  it("strips newlines from subjects", () => expect(oneLine("Hi\r\nBcc: victim@x.com")).toBe("Hi Bcc: victim@x.com"));
  it("redacts email and phone before logging", () => {
    const out = redact("priya@college.in called +91 98765 43210");
    expect(out).not.toContain("priya@college.in");
    expect(out).not.toContain("98765");
  });
});

describe("SSRF guard", () => {
  it.each(["127.0.0.1", "10.0.0.5", "172.16.3.1", "192.168.1.1", "169.254.169.254", "0.0.0.0", "::1", "fd00::1", "::ffff:127.0.0.1"])("%s is private", (ip) =>
    expect(isPrivateIp(ip)).toBe(true),
  );
  it.each(["8.8.8.8", "142.250.183.14"])("%s is public", (ip) => expect(isPrivateIp(ip)).toBe(false));
  it("blocks localhost, metadata IP and non-http schemes", async () => {
    await expect(assertPublicUrl("http://localhost:3000/admin")).rejects.toThrow(/blocked/);
    await expect(assertPublicUrl("http://169.254.169.254/latest/meta-data")).rejects.toThrow(/blocked/);
    await expect(assertPublicUrl("file:///etc/passwd")).rejects.toThrow(/blocked/);
    await expect(assertPublicUrl("http://user:pass@8.8.8.8/")).rejects.toThrow(/blocked/);
  });
});

describe("rate limiting (in-memory fallback)", () => {
  it("returns 429-equivalent after the limit", () => {
    const key = `test:${Math.random()}`;
    const results = Array.from({ length: 12 }, () => memoryLimit(key, 10, 60).success);
    expect(results.filter(Boolean)).toHaveLength(10);
    expect(results.slice(10)).toEqual([false, false]);
  });
  it("resets after the window", () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 3; i++) memoryLimit(key, 3, 60, 0);
    expect(memoryLimit(key, 3, 60, 1).success).toBe(false);
    expect(memoryLimit(key, 3, 60, 61_000).success).toBe(true);
  });
});
