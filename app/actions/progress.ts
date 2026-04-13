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
    throw new Error("Failed to save completion");
  }

  revalidatePath("/dashboard");
  revalidatePath(`/course/${lessonId}`);
  return { success: true };
}

/**
 * Save in-progress lesson state (screen index, unit, checklist ticks, etc.).
 *
 * Each lesson has up to 3 units. The iframe only sends gates for the current
 * unit, so we merge into a `_units` namespace to preserve all unit data for
 * artifact generation. The top-level keys stay flat for iframe restore compat.
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

  // Read existing state_data to preserve previous unit gate responses
  const { data: existing } = await supabase
    .from("course_progress")
    .select("state_data")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  const prev = (existing?.state_data as Record<string, unknown>) ?? {};
  const prevUnits = (prev._units as Record<string, unknown>) ?? {};
  const currentUnit = (stateData.unit as string) ?? "1";

  // Merge: keep top-level flat (for iframe restore), archive in _units
  const merged: Record<string, unknown> = {
    ...stateData,
    _units: {
      ...prevUnits,
      [currentUnit]: stateData,
    },
  };

  const { error } = await supabase.from("course_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      last_screen: lastScreen,
      state_data: merged,
    },
    { onConflict: "user_id,lesson_id" }
  );

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
