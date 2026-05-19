"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";

const MAX_WEEKS = 26; // 6 months — anything longer should be a refund conversation.

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
