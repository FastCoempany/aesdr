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
  /** All 12 courses completed (fires once). */
  course_completed: Record<string, never>;
  /** In-product lesson feedback submitted (stuck / disagree / didn't land). */
  lesson_feedback_submitted: { lesson_id: string; kind: string };
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
  /** Affiliate link click (logged by /r/[slug]). */
  affiliate_clicked: { affiliate_slug: string; link_id: string };
  /** Affiliate attribution recorded (purchase matched to a click). */
  affiliate_attributed: {
    affiliate_slug: string;
    link_id: string;
    purchase_id: string;
    commission_cents: number;
  };
  /** Affiliate payout marked paid by founder. */
  affiliate_payout_paid: {
    affiliate_slug: string;
    payout_id: string;
    total_cents: number;
  };
  /** One LLM agent run's dollar cost (scout sweep / dossier brief). Feeds the
   *  tower's daily spend meter and the $10/day wall. */
  agent_spend: {
    agent: string;
    usd: number;
    pipeline_id: string | null;
  };
  /** Affiliate submitted a draft copy piece for brand-conformance review. */
  affiliate_copy_submitted: {
    affiliate_id: string;
    affiliate_slug: string;
    submission_id: string;
    channel: string;
    format: string;
    /** R4-LEG-5 soft warning: draft carried no recognizable FTC disclosure marker. */
    missing_ftc_disclosure: boolean;
  };
  /** Admin approved a copy submission. */
  affiliate_copy_approved: {
    affiliate_id: string;
    affiliate_slug: string;
    submission_id: string;
    gate_cleared_now: boolean;
  };
  /** Admin requested edits on a copy submission. */
  affiliate_copy_edits_requested: {
    submission_id: string;
    affiliate_id: string;
  };
  /** Admin declined a copy submission (strike recorded). */
  affiliate_copy_declined: {
    affiliate_id: string;
    affiliate_slug: string;
    submission_id: string;
    category: string;
    strike_number: number;
    auto_paused: boolean;
  };
  /** Affiliate lifecycle status change (vetting/active/paused/sunset/cut). */
  affiliate_status_changed: {
    affiliate_id: string;
    status: string;
  };
  /** Affiliate connected a Stripe Connect Standard account. */
  affiliate_stripe_connected: {
    affiliate_id: string;
    stripe_account_id: string;
  };
  /** Affiliate's Stripe Connect account became fully enabled (charges + payouts). */
  affiliate_stripe_enabled: {
    affiliate_id: string;
    stripe_account_id: string;
  };
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
    // Operational telemetry should never break the user's request. Log only
    // message/code — the event row carries `email`, and a full Supabase error
    // object can echo it back in `details`/`hint` (R5-PI-5).
    const e = err as { message?: string; code?: string };
    console.warn("[events] insert failed", type, e?.message, e?.code);
  }
}
