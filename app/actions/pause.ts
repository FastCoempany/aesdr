"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const MAX_WEEKS = 26; // 6 months — anything longer should be a refund conversation.

/**
 * Shared "is this buyer paused?" check (P1-6). The pause is written to
 * `user_metadata.paused_until` by setPause(); every retention/lifecycle
 * cron must honor it so a paused buyer receives nothing.
 *
 * Builds its own service-role admin client so its signature stays
 * serializable under this file's "use server" directive (a passed-in
 * Supabase client can't cross the server-action boundary). `nowMs` is the
 * comparison anchor (defaults to call time); injectable for testing.
 *
 * Fail-open by design: an auth.users lookup error returns `false` (not
 * paused) rather than silently suppressing a wanted send — a transient
 * read failure should not look like a pause.
 *
 * Each cron run holds its own per-invocation Map<string, Promise<boolean>>
 * and memoizes calls to this helper itself, so the inner loop never
 * re-hits auth.users for the same user_id. (A memoizing factory can't live
 * here: this file is "use server", so every export must be an async
 * function — a closure-returning factory would be rejected at build.)
 */
export async function isPausedUser(
  userId: string,
  nowMs: number = Date.now(),
): Promise<boolean> {
  if (!userId) return false;
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.getUserById(userId);
    const until = data?.user?.user_metadata?.paused_until as string | undefined;
    return !!until && new Date(until).getTime() > nowMs;
  } catch {
    return false;
  }
}

/**
 * "Life happened" pause. Sets user_metadata.paused_until so retention
 * crons (drop-off, weekly framing, win-back, lesson-completion nudges)
 * skip the user until that date. Per audit H.4.2.
 */
export async function setPause(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const weeksRaw = Number(formData.get("weeks"));
  if (!Number.isFinite(weeksRaw) || weeksRaw < 1 || weeksRaw > MAX_WEEKS) {
    throw new Error("Pick a pause window between 1 and 26 weeks.");
  }
  const weeks = Math.floor(weeksRaw);
  const until = new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000);

  const { error } = await supabase.auth.updateUser({
    data: { paused_until: until.toISOString() },
  });
  if (error) throw new Error(error.message);

  revalidatePath("/account");
}

export async function clearPause() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.auth.updateUser({
    data: { paused_until: null },
  });
  if (error) throw new Error(error.message);

  revalidatePath("/account");
}
