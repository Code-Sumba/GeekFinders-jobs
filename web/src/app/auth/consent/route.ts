import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function POST() {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await supabase.from("users").update({ consent_at: new Date().toISOString() }).eq("id", user.id).is("consent_at", null);
  return NextResponse.json({ ok: true });
}
