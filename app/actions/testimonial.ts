"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";

type SubmitResult = { ok: true } | { ok: false; error: string };

/**
 * Submit a testimonial. Stores as status='pending' for founder approval.
 * Re-submit replaces the user's prior pending row (Postgres upsert via
 * the unique (user_id) index added in 20260519_testimonials.sql).
 */
export async function submitTestimonial(formData: FormData): Promise<SubmitResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You need to be signed in." };

  const ratingRaw = Number(formData.get("rating"));
  const body = String(formData.get("body") ?? "").trim();
  const displayName =
    String(formData.get("displayName") ?? "").trim().slice(0, 80) || null;
  const permitPublish = formData.get("permitPublish") === "on";

  if (!Number.isInteger(ratingRaw) || ratingRaw < 1 || ratingRaw > 5) {
    return { ok: false, error: "Rating must be 1–5." };
  }
  if (!body || body.length < 4) {
    return { ok: false, error: "Tell us in at least a sentence." };
  }
  if (body.length > 1000) {
    return { ok: false, error: "Keep it under 1000 characters." };
  }

  const role =
    user.user_metadata?.role === "ae" || user.user_metadata?.role === "sdr"
      ? (user.user_metadata.role as string)
      : null;

  const { error } = await supabase.from("testimonials").upsert(
    {
      user_id: user.id,
      email: user.email ?? "",
      display_name: displayName,
      role,
      rating: ratingRaw,
      body,
      permit_publish: permitPublish,
      status: "pending",
      submitted_at: new Date().toISOString(),
      source: "in_app",
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("[testimonial] insert failed", error);
    return { ok: false, error: "Couldn't save. Try again in a minute." };
  }

  revalidatePath("/account/review");
  return { ok: true };
}
