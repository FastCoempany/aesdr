"use server";

import { revalidatePath } from "next/cache";

import { logEvent } from "@/lib/events";
import { createClient } from "@/utils/supabase/server";
import { LESSONS } from "@/utils/progress/types";
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
    throw new Error("Failed to save completion");
  }

  await logEvent(
    "lesson_completed",
    { lesson_id: lessonId },
    { userId: user.id, email: user.email ?? null }
  );

  // If this completion lands us at all 12, fire the once-per-user
  // course_completed event. Idempotent: check the events table first so
  // re-marking-complete on a finished course doesn't re-fire.
  const { count: completedCount } = await supabase
    .from("course_progress")
    .select("lesson_id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_completed", true);
  if ((completedCount ?? 0) >= LESSONS.length) {
    const { count: priorFire } = await supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("event_type", "course_completed");
    if (!priorFire) {
      await logEvent(
        "course_completed",
        {},
        { userId: user.id, email: user.email ?? null }
      );
    }
  }

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Save in-progress lesson state (screen index, unit, checklist ticks, etc.).
 *
 * Uses a Supabase RPC function (merge_lesson_progress) for atomic merge.
 * This eliminates the race condition where two tabs could read-then-write
 * concurrently and overwrite each other's unit data.
 *
 * The RPC function handles the _units namespace merge at the DB level
 * with SELECT ... FOR UPDATE row locking.
 *
 * Resulting state_data shape:
 *   { gate_1: {...}, gate_3: {...}, unit: "2", _extra: {...},
 *     _units: { "1": { gate_1: {...}, ... }, "2": { gate_1: {...}, ... } } }
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

  const { error } = await supabase.rpc("merge_lesson_progress", {
    p_user_id: user.id,
    p_lesson_id: lessonId,
    p_last_screen: lastScreen,
    p_state_data: stateData,
  });

  if (error) {
    throw new Error("Failed to save progress");
  }

  return { success: true };
}

/**
 * Sign the current user out.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/dashboard");
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
    return [];
  }

  return data ?? [];
}
