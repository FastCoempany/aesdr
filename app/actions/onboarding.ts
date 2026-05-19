"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { logEvent } from "@/lib/events";
import { createClient } from "@/utils/supabase/server";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
type Day = (typeof DAYS)[number];

// HH:MM 24h
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const PLACE_MAX = 80;
const STAKEHOLDER_MAX = 80;

/**
 * Save the user's implementation intention (study window) + optional weekly
 * nudge opt-in. Stores into Supabase user_metadata so it's available on
 * every server render without an extra DB hit.
 *
 * Behavioral: per Gollwitzer 1999, naming when/where/what triples the odds
 * the behaviour actually occurs. The form is the smallest viable version of
 * that intention — day, time, place. We capture the optional stakeholder
 * separately as a soft social-stake.
 */
export async function saveOnboarding(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const day = String(formData.get("day") ?? "").toLowerCase();
  const time = String(formData.get("time") ?? "");
  const place = String(formData.get("place") ?? "").trim().slice(0, PLACE_MAX);
  const stakeholder = String(formData.get("stakeholder") ?? "")
    .trim()
    .slice(0, STAKEHOLDER_MAX);
  const weeklyNudge = formData.get("weeklyNudge") === "on";

  if (!DAYS.includes(day as Day)) throw new Error("Invalid day.");
  if (!TIME_RE.test(time)) throw new Error("Invalid time. Use HH:MM (24h).");
  if (!place) throw new Error("Tell me where you'll study.");

  const { error } = await supabase.auth.updateUser({
    data: {
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      study_window: { day, time, place },
      stakeholder: stakeholder || null,
      weekly_nudge_optin: weeklyNudge,
    },
  });

  if (error) throw new Error(error.message);

  await logEvent(
    "onboarding_completed",
    {
      role: (user.user_metadata?.role as string) || "unknown",
      day,
      time,
      weekly_nudge_optin: weeklyNudge,
    },
    { userId: user.id, email: user.email ?? null }
  );

  redirect("/dashboard");
}

/**
 * "Skip for now" — sets a long-lived cookie so the dashboard stops
 * redirecting back to the onboarding screen. We deliberately don't set
 * onboarding_completed in user_metadata, so a future surfacing of the
 * onboarding (banner, link in account) still reads as not-yet-done.
 */
export async function skipOnboarding() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const cookieStore = await cookies();
  cookieStore.set("aesdr_onboarding_skipped", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  await logEvent(
    "onboarding_skipped",
    { role: (user.user_metadata?.role as string) || "unknown" },
    { userId: user.id, email: user.email ?? null }
  );
  redirect("/dashboard");
}
