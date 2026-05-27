"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/utils/supabase/admin";

const ALLOWED = ["new", "reviewed", "dismissed"] as const;

export async function setLessonFeedbackStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id) throw new Error("Missing id.");
  if (!(ALLOWED as readonly string[]).includes(status)) {
    throw new Error("Invalid status.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("lesson_feedback")
    .update({
      status,
      status_changed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/lesson-feedback");
}
