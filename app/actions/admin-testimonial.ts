"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/utils/supabase/admin";

const ALLOWED = ["approved", "rejected", "pending"] as const;

export async function setTestimonialStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id) throw new Error("Missing id.");
  if (!(ALLOWED as readonly string[]).includes(status)) {
    throw new Error("Invalid status.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("testimonials")
    .update({
      status,
      status_changed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/testimonials");
  revalidatePath("/"); // landing Testimonials component re-fetches
}
