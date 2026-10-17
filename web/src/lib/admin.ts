import { notFound } from "next/navigation";
import { adminClient, requireUser } from "./supabase/server";

/** Server-side role check (role = 'admin' in DB). Non-admins get a 404, not a hint the page exists. */
export async function requireAdmin() {
  const { user } = await requireUser();
  if (!user) notFound();
  const admin = adminClient();
  const { data } = await admin.from("users").select("role, name, email").eq("id", user.id).single();
  if (data?.role !== "admin") notFound();
  return { user, admin, profile: data };
}

export async function audit(
  actorId: string,
  action: string,
  target: { table: string; id: string },
  before?: unknown,
  after?: unknown,
) {
  await adminClient()
    .from("audit_log")
    .insert({ actor_id: actorId, action, target_table: target.table, target_id: target.id, before: before ?? null, after: after ?? null });
}
