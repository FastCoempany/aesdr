import type { SupabaseClient, User } from "@supabase/supabase-js";

import { isAdminEmail } from "@/lib/admin";
import { TOTAL_LESSONS } from "@/lib/config";

/**
 * True if the user has completed every course lesson (or is an admin — founder
 * preview). Shared by the artifacts API, the $40 second-artifact unlock checkout,
 * and the reveal pick so none of them can be triggered before the course is
 * actually finished.
 *
 * AUDIT (adversarial re-audit 2026-06-29): this used to honor the
 * client-FORGEABLE `aesdr_bypass` cookie (set via document.cookie, checked as
 * `=== "1"`). That let any visitor unlock paid completion. Replaced with the
 * server-trusted `isAdminEmail` (from the JWT-validated email) so a forged cookie
 * is worthless.
 */
export async function userHasCompletedCourse(
  supabase: SupabaseClient,
  user: User,
): Promise<boolean> {
  if (isAdminEmail(user.email)) return true;

  const { data: progress } = await supabase
    .from("course_progress")
    .select("lesson_id, is_completed")
    .eq("user_id", user.id);

  const completedCount = (progress ?? []).filter((r) => r.is_completed).length;
  return completedCount >= TOTAL_LESSONS;
}
