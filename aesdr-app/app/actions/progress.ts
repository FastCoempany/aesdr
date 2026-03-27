"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";
import type { LessonProgressSummary } from "@/utils/progress/types";

/**
 * Mark a lesson as completed (called when the learner finishes the last screen).
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
 * Save in-progress lesson state (screen index, checklist ticks, quiz answers, etc.).
 * Called as the learner navigates within a lesson.
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
 * Fetch progress for a single lesson (used on the lesson page).
 */
export async function getLessonProgress(lessonId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("course_progress")
    .select("is_completed, last_screen, state_data")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load lesson progress:", error);
    return null;
  }

  return data;
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
