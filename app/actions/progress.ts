"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";
import type { LessonProgressSummary } from "@/utils/progress/types";

/**
 * Mark a lesson as completed.
 */
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
    { onConflict: "user_id,lesson_id" }
  );

  if (error) {
    console.error("Failed to save completion:", error);
    throw new Error("Database error");
  }

  revalidatePath("/");
  revalidatePath(`/course/${lessonId}`);
  return { success: true };
}

/**
 * Save in-progress lesson state (screen index, unit, checklist ticks, etc.).
 */
export async function saveLessonProgress(
  lessonId: string,
  lastScreen: number,
  stateData: Record<string, unknown>
) {
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
      last_screen: lastScreen,
      state_data: stateData,
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (error) {
    console.error("Failed to save progress:", error);
    throw new Error("Database error");
  }

  return { success: true };
}

/**
 * Sign the current user out.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
}

/**
 * Fetch progress summaries for ALL lessons (used on the dashboard).
 */
export async function getAllProgress(): Promise<LessonProgressSummary[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("course_progress")
    .select("lesson_id, is_completed, last_screen")
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to load all progress:", error);
    return [];
  }

  return data ?? [];
}
