import { NextResponse } from "next/server";
import { safeNext } from "@/lib/security";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  // Only internal relative paths — blocks ?next=https://phishing.example
  const next = safeNext(url.searchParams.get("next"), "/onboarding");
  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    if (data.user && url.searchParams.get("consent") === "1") {
      await supabase.from("users").update({ consent_at: new Date().toISOString() }).eq("id", data.user.id).is("consent_at", null);
    }
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
