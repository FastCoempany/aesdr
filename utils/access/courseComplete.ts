import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { TOTAL_LESSONS } from "@/lib/config";

/**
 * True if the user has completed every course lesson (or holds the founder
 * bypass cookie). Shared by the artifacts API, the $40 second-artifact unlock
 * checkout, and the reveal pick so none of them can be triggered before the
 * course is actually finished (audit adversarial pass: #1 / P1-16 + #2).
 */
export async function userHasCompletedCourse(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const cookieStore = await cookies();
  if (cookieStore.get("aesdr_bypass")?.value === "1") return true;

  const { data: progress } = await supabase
    .from("course_progress")
    .select("lesson_id, is_completed")
    .eq("user_id", userId);

  const completedCount = (progress ?? []).filter((r) => r.is_completed).length;
  return completedCount >= TOTAL_LESSONS;
}
