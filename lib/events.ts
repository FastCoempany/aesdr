/**
 * Server-side event log (Supabase `events` table).
 *
 * Independent of PostHog — PostHog is the analytics product, this is the
 * operational substrate the cron jobs + admin dashboards query directly.
 *
 * Type-safe at the call site: each event_type has its own props shape
 * registered in EventMap. Fire-and-forget; logging failures should not
 * break the request. See migration 20260519_events.sql.
 */

import { createAdminClient } from "@/utils/supabase/admin";

export type EventMap = {
  /** Onboarding completed (study window saved). */
  onboarding_completed: {
    role: string;
    day: string;
    time: string;
    weekly_nudge_optin: boolean;
  };
  /** Onboarding skipped via "Skip for now". */
  onboarding_skipped: { role: string };
  /** A lesson was opened (entry to /course/[id]). */
  lesson_opened: { lesson_id: string; unit_id?: string };
  /** Marked complete. */
  lesson_completed: { lesson_id: string };
  /** All 12 lessons completed (fires once). */
  course_completed: Record<string, never>;
  /** Free reciprocity asset captured an email. */
  free_lead_captured: { source: string; role?: string | null };
  /** Testimonial submitted (any rating). */
  testimonial_submitted: { rating: number; permit_publish: boolean };
  /** LinkedIn-share button clicked from the certificate. */
  certificate_shared: { surface: "linkedin" | "copy_link" };
  /** Outbound: lesson-completed nudge dispatched. */
  lesson_nudge_sent: { lesson_id: string; next_lesson_id: string };
  /** Outbound: Sunday framing email dispatched. */
  weekly_framing_sent: { completed: number; total: number };
  /** Outbound: win-back email dispatched. */
  win_back_sent: { completed: number; purchased_at: string };
  /** Outbound: 6-month / 12-month alumni re-engagement email. */
  alumni_reengagement_sent: { month_mark: 6 | 12 };
};

export type EventType = keyof EventMap;

interface LogOpts {
  userId?: string | null;
  email?: string | null;
  ipHash?: string | null;
  userAgent?: string | null;
}

/**
 * Log an event. Never throws — at worst the row is missed.
 */
export async function logEvent<E extends EventType>(
  type: E,
  props: EventMap[E],
  opts: LogOpts = {}
): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("events").insert({
      user_id: opts.userId ?? null,
      email: opts.email ?? null,
      event_type: type,
      props: props as Record<string, unknown>,
      ip_hash: opts.ipHash ?? null,
      user_agent: opts.userAgent ?? null,
    });
  } catch (err) {
    // Operational telemetry should never break the user's request.
    console.warn("[events] insert failed", type, err);
  }
}
