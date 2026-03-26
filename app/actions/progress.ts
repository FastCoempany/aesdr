"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";

export async function markLessonComplete(lessonId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("course_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      is_completed: true,
      completed_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,lesson_id",
    }
  );

  if (error) {
    console.error("Failed to save progress:", error);
    throw new Error("Database error");
  }

  revalidatePath(`/course/${lessonId}`);

  return { success: true };
}
