export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

import {
  sendAlumniReengagement,
  sendLessonCompletedNudge,
  sendWeeklyFraming,
  sendWinBack,
} from "@/lib/email";
import { TIMING, TOTAL_LESSONS } from "@/lib/config";
import { verifyCronAuth } from "@/lib/cron-auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { LESSONS } from "@/utils/progress/types";

const DURATION_BY_ID = new Map<string, number>([
  ["1", 22], ["2", 24], ["3", 28], ["4", 26], ["5", 32], ["6", 28],
  ["7", 30], ["8", 24], ["9", 22], ["10", 26], ["11", 22], ["12", 26],
]);

interface ProgressRow {
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  completed_at: string | null;
  updated_at: string;
}

interface PurchaseRow {
  user_id: string | null;
  user_email: string;
  customer_name: string | null;
  purchased_at: string;
  lesson_nudge_last_id?: string | null;
}

/**
 * Three retention email loops, batched into one cron entrypoint:
 *   1. Lesson-completion nudges (T+24h after a lesson is marked done)
 *   2. Weekly framing emails (Sundays only)
 *   3. Win-back (T+45d, ≤2 lessons, ≥30d silent)
 *
 * Idempotency is enforced via the events table: each branch checks for
 * a prior fire keyed on (user_id, event_type, props.lesson_id) before
 * sending. No new columns required on purchases.
 */
export async function GET(request: Request) {
  const authErr = verifyCronAuth(request);
  if (authErr) return authErr;

  const url = new URL(request.url);
  const dryRun = url.searchParams.get("dryRun") === "1";

  const supabase = createAdminClient();
  const now = new Date();
  const errors: string[] = [];
  let lessonNudges = 0;
  let weekly = 0;
  let winBack = 0;
  let alumni6 = 0;
  let alumni12 = 0;

  /**
   * Check whether a user_id is currently paused (paused_until > now).
   * Pulls from auth.users metadata via the admin client. Cached per-run
   * to avoid hammering auth.users in the inner loop.
   */
  const pausedCache = new Map<string, boolean>();
  async function isPaused(userId: string): Promise<boolean> {
    if (pausedCache.has(userId)) return pausedCache.get(userId)!;
    const { data } = await supabase.auth.admin.getUserById(userId);
    const until = data?.user?.user_metadata?.paused_until as string | undefined;
    const paused = !!until && new Date(until).getTime() > now.getTime();
    pausedCache.set(userId, paused);
    return paused;
  }

  // ── 1. Lesson-completion nudges ──────────────────────────────────────
  const nudgeStart = new Date(now.getTime() - TIMING.lessonNudge.after - TIMING.lessonNudge.window);
  const nudgeEnd = new Date(now.getTime() - TIMING.lessonNudge.after);
  const { data: recentCompletions, error: rcErr } = await supabase
    .from("course_progress")
    .select("user_id, lesson_id, is_completed, completed_at, updated_at")
    .eq("is_completed", true)
    .gte("completed_at", nudgeStart.toISOString())
    .lte("completed_at", nudgeEnd.toISOString())
    .limit(2000);
  if (rcErr) errors.push(`completions query: ${rcErr.message}`);

  for (const c of (recentCompletions ?? []) as ProgressRow[]) {
    if (!c.user_id) continue;
    if (await isPaused(c.user_id)) continue;
    // Find next lesson index for this user
    const completedIdx = LESSONS.findIndex((l) => l.id === c.lesson_id);
    if (completedIdx < 0 || completedIdx >= LESSONS.length - 1) continue;
    const nextLesson = LESSONS[completedIdx + 1];

    // Skip if user has already completed the next lesson
    const { count: nextDone } = await supabase
      .from("course_progress")
      .select("lesson_id", { count: "exact", head: true })
      .eq("user_id", c.user_id)
      .eq("lesson_id", nextLesson.id)
      .eq("is_completed", true);
    if ((nextDone ?? 0) > 0) continue;

    // Idempotency: have we already sent a nudge for THIS completed lesson?
    const { count: prior } = await supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", c.user_id)
      .eq("event_type", "lesson_nudge_sent")
      .contains("props", { lesson_id: c.lesson_id });
    if ((prior ?? 0) > 0) continue;

    const { data: purchase } = await supabase
      .from("purchases")
      .select("user_email, customer_name")
      .eq("user_id", c.user_id)
      .eq("status", "active")
      .maybeSingle();
    if (!purchase?.user_email) continue;

    if (dryRun) {
      lessonNudges++;
      continue;
    }
    const minutes = DURATION_BY_ID.get(nextLesson.id) ?? 25;
    const ok = await sendLessonCompletedNudge(
      purchase.user_email,
      purchase.customer_name || "there",
      nextLesson.id,
      nextLesson.title,
      minutes
    );
    if (!ok) {
      errors.push(`lesson-nudge send failed for ${purchase.user_email}`);
      continue;
    }
    await supabase.from("events").insert({
      user_id: c.user_id,
      email: purchase.user_email,
      event_type: "lesson_nudge_sent",
      props: { lesson_id: c.lesson_id, next_lesson_id: nextLesson.id },
    });
    lessonNudges++;
  }

  // ── 2. Weekly framing (Sundays only) ─────────────────────────────────
  if (now.getUTCDay() === 0) {
    const minPurchaseDate = new Date(
      now.getTime() - TIMING.weeklyFraming.maxDaysSincePurchase * 24 * 60 * 60 * 1000
    ).toISOString();
    const maxPurchaseDate = new Date(
      now.getTime() - TIMING.weeklyFraming.minDaysSincePurchase * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: candidates, error: wErr } = await supabase
      .from("purchases")
      .select("user_id, user_email, customer_name, purchased_at")
      .eq("status", "active")
      .gte("purchased_at", minPurchaseDate)
      .lte("purchased_at", maxPurchaseDate)
      .limit(2000);
    if (wErr) errors.push(`weekly query: ${wErr.message}`);

    // Filter idempotency in a single batched events query.
    const startOfWeek = new Date(now);
    startOfWeek.setUTCHours(0, 0, 0, 0);
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - 6);

    for (const p of (candidates ?? []) as PurchaseRow[]) {
      if (!p.user_id) continue;
      if (await isPaused(p.user_id)) continue;
      const { count: priorThisWeek } = await supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("user_id", p.user_id)
        .eq("event_type", "weekly_framing_sent")
        .gte("occurred_at", startOfWeek.toISOString());
      if ((priorThisWeek ?? 0) > 0) continue;

      const { data: progress } = await supabase
        .from("course_progress")
        .select("lesson_id, is_completed")
        .eq("user_id", p.user_id);
      const completed = (progress ?? []).filter((r) => r.is_completed).length;
      if (completed >= TOTAL_LESSONS) continue;

      if (dryRun) {
        weekly++;
        continue;
      }
      const ok = await sendWeeklyFraming(
        p.user_email,
        p.customer_name || "there",
        completed,
        TOTAL_LESSONS
      );
      if (!ok) {
        errors.push(`weekly send failed for ${p.user_email}`);
        continue;
      }
      await supabase.from("events").insert({
        user_id: p.user_id,
        email: p.user_email,
        event_type: "weekly_framing_sent",
        props: { completed, total: TOTAL_LESSONS },
      });
      weekly++;
    }
  }

  // ── 3. Win-back (T+45d, low engagement, long silent) ────────────────
  const winBackPurchaseCutoff = new Date(
    now.getTime() - TIMING.winBack.after
  ).toISOString();
  const winBackSilentCutoff = new Date(
    now.getTime() - TIMING.winBack.minDaysSilent * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: winBackCandidates, error: wbErr } = await supabase
    .from("purchases")
    .select("user_id, user_email, customer_name, purchased_at")
    .eq("status", "active")
    .lte("purchased_at", winBackPurchaseCutoff)
    .limit(2000);
  if (wbErr) errors.push(`win-back query: ${wbErr.message}`);

  for (const p of (winBackCandidates ?? []) as PurchaseRow[]) {
    if (!p.user_id) continue;
    if (await isPaused(p.user_id)) continue;
    // Only send once per user, ever.
    const { count: prior } = await supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", p.user_id)
      .eq("event_type", "win_back_sent");
    if ((prior ?? 0) > 0) continue;

    const { data: progress } = await supabase
      .from("course_progress")
      .select("lesson_id, is_completed, updated_at")
      .eq("user_id", p.user_id);
    const completed = (progress ?? []).filter((r) => r.is_completed).length;
    if (completed > TIMING.winBack.maxCompletedLessons) continue;
    const lastActivity = (progress ?? [])
      .map((r) => r.updated_at)
      .sort()
      .pop();
    if (lastActivity && lastActivity > winBackSilentCutoff) continue;

    if (dryRun) {
      winBack++;
      continue;
    }
    const ok = await sendWinBack(p.user_email, p.customer_name || "there");
    if (!ok) {
      errors.push(`win-back send failed for ${p.user_email}`);
      continue;
    }
    await supabase.from("events").insert({
      user_id: p.user_id,
      email: p.user_email,
      event_type: "win_back_sent",
      props: { completed, purchased_at: p.purchased_at },
    });
    winBack++;
  }

  // ── 4. Alumni re-engagement (6 / 12 month after course_completed event) ──
  const monthMarks: { mark: 6 | 12; counterRef: (n: number) => void; minDays: number; maxDays: number }[] = [
    { mark: 6, counterRef: (n) => (alumni6 = n), minDays: 180, maxDays: 187 },
    { mark: 12, counterRef: (n) => (alumni12 = n), minDays: 365, maxDays: 372 },
  ];
  for (const m of monthMarks) {
    const minTime = new Date(now.getTime() - m.maxDays * 24 * 60 * 60 * 1000).toISOString();
    const maxTime = new Date(now.getTime() - m.minDays * 24 * 60 * 60 * 1000).toISOString();
    const { data: completers } = await supabase
      .from("events")
      .select("user_id, email")
      .eq("event_type", "course_completed")
      .gte("occurred_at", minTime)
      .lte("occurred_at", maxTime)
      .limit(2000);
    let sent = 0;
    for (const c of (completers ?? []) as { user_id: string | null; email: string | null }[]) {
      if (!c.user_id || !c.email) continue;
      if (await isPaused(c.user_id)) continue;
      const { count: prior } = await supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("user_id", c.user_id)
        .eq("event_type", "alumni_reengagement_sent")
        .contains("props", { month_mark: m.mark });
      if ((prior ?? 0) > 0) continue;

      if (dryRun) {
        sent++;
        continue;
      }
      const { data: purchase } = await supabase
        .from("purchases")
        .select("customer_name")
        .eq("user_id", c.user_id)
        .maybeSingle();
      const ok = await sendAlumniReengagement(
        c.email,
        purchase?.customer_name || "there",
        m.mark
      );
      if (!ok) {
        errors.push(`alumni-${m.mark}m send failed for ${c.email}`);
        continue;
      }
      await supabase.from("events").insert({
        user_id: c.user_id,
        email: c.email,
        event_type: "alumni_reengagement_sent",
        props: { month_mark: m.mark },
      });
      sent++;
    }
    m.counterRef(sent);
  }

  if (errors.length > 0) {
    Sentry.captureMessage("[cron/retention] Errors", { level: "error", extra: { errors } });
  }
  return NextResponse.json({
    lessonNudges,
    weekly,
    winBack,
    alumni6,
    alumni12,
    dryRun,
    errors: errors.length > 0 ? errors : undefined,
  });
}
