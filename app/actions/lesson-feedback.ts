"use server";

import { revalidatePath } from "next/cache";

import { logEvent } from "@/lib/events";
import { createClient } from "@/utils/supabase/server";
import { LESSONS } from "@/utils/progress/types";

type SubmitResult = { ok: true } | { ok: false; error: string };

const KINDS = ["stuck", "disagree", "didnt_land", "other"] as const;

/**
 * Submit per-lesson feedback ("stuck / I disagree / didn't land / other").
 * Stored as status='new' for founder triage in /admin/lesson-feedback.
 */
export async function submitLessonFeedback(
  formData: FormData
): Promise<SubmitResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You need to be signed in." };

  const lessonId = String(formData.get("lessonId") ?? "");
  const kind = String(formData.get("kind") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 2000) || null;
  const lastScreenRaw = Number(formData.get("lastScreen"));
  const lastScreen = Number.isInteger(lastScreenRaw) ? lastScreenRaw : null;

  if (!LESSONS.some((l) => l.id === lessonId)) {
    return { ok: false, error: "Unknown lesson." };
  }
  if (!(KINDS as readonly string[]).includes(kind)) {
    return { ok: false, error: "Pick what kind of feedback this is." };
  }
  if ((kind === "stuck" || kind === "disagree") && !note) {
    return { ok: false, error: "Tell us in a sentence — that's the useful part." };
  }

  const role =
    user.user_metadata?.role === "ae" || user.user_metadata?.role === "sdr"
      ? (user.user_metadata.role as string)
      : null;

  const { error } = await supabase.from("lesson_feedback").insert({
    user_id: user.id,
    email: user.email ?? null,
    lesson_id: lessonId,
    role,
    kind,
    note,
    last_screen: lastScreen,
    status: "new",
  });

  if (error) {
    console.error("[lesson-feedback] insert failed", error);
    return { ok: false, error: "Couldn't save. Try again in a minute." };
  }

  await logEvent(
    "lesson_feedback_submitted",
    { lesson_id: lessonId, kind },
    { userId: user.id, email: user.email ?? null }
  );

  revalidatePath("/admin/lesson-feedback");
  return { ok: true };
}
