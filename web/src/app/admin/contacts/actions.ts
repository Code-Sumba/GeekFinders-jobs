"use server";

import { revalidatePath } from "next/cache";
import { audit, requireAdmin } from "@/lib/admin";
import { uuid } from "@/lib/validate";

export async function setDoNotContact(id: string, flagged: boolean) {
  const { user, admin } = await requireAdmin();
  if (!uuid.safeParse(id).success) throw new Error("bad request");
  const { data: before } = await admin.from("company_contacts").select("email, do_not_contact").eq("id", id).single();
  await admin.from("company_contacts").update({ do_not_contact: flagged }).eq("id", id);
  await audit(user.id, flagged ? "contact.flag" : "contact.unflag", { table: "company_contacts", id }, before, { do_not_contact: flagged });
  revalidatePath("/admin/contacts");
}
