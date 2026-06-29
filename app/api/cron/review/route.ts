export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendReviewRequest, sendReviewNudge, getSuppressedEmails } from '@/lib/email';
import { TIMING, TOTAL_LESSONS } from '@/lib/config';
import { verifyCronAuth } from '@/lib/cron-auth';
import { isPausedUser } from '@/app/actions/pause';

// R4-PERF-7: bounded send pool to respect Resend's ~2 req/s limit; only a TRUE
// send returns the email, so a false/429 never sets the review/nudge flag.
const SEND_CONCURRENCY = 5;

async function runPool<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<string | null>,
): Promise<string[]> {
  const successes: string[] = [];
  let cursor = 0;
  async function lane(): Promise<void> {
    while (cursor < items.length) {
      const idx = cursor++;
      const ok = await worker(items[idx]);
      if (ok) successes.push(ok);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => lane()),
  );
  return successes;
}

export async function GET(request: Request) {
  const authErr = verifyCronAuth(request);
  if (authErr) return authErr;

  const supabase = createAdminClient();
  const now = new Date();
  const nowMs = now.getTime();
  const errors: string[] = [];

  // P1-6: per-run pause cache so a paused buyer receives nothing.
  const pauseCache = new Map<string, Promise<boolean>>();
  const isPaused = (userId: string | null): Promise<boolean> => {
    if (!userId) return Promise.resolve(false);
    const hit = pauseCache.get(userId);
    if (hit) return hit;
    const p = isPausedUser(userId, nowMs);
    pauseCache.set(userId, p);
    return p;
  };

  // ── Review request: 2 days after completing all 12 courses ──
  const { data: completedUsers, error: qErr } = await supabase
    .from('purchases')
    .select('user_email, user_id, customer_name')
    .eq('status', 'active')
    .eq('review_requested', false)
    .limit(1000);

  const reviewSuccesses: string[] = [];

  if (qErr) errors.push(`review query: ${qErr.message}`);

  if (completedUsers && completedUsers.length > 0) {
    const userIds = [...new Set(completedUsers.map((u) => u.user_id).filter(Boolean))];
    const { data: allProgress, error: pErr } = await supabase
      .from('course_progress')
      .select('user_id, is_completed, updated_at')
      .in('user_id', userIds)
      .eq('is_completed', true);

    if (pErr) errors.push(`progress query: ${pErr.message}`);

    const completionByUser = new Map<string, { count: number; lastCompletedAt: Date }>();
    for (const row of allProgress ?? []) {
      const entry = completionByUser.get(row.user_id) ?? { count: 0, lastCompletedAt: new Date(0) };
      entry.count++;
      const rowDate = new Date(row.updated_at);
      if (rowDate > entry.lastCompletedAt) entry.lastCompletedAt = rowDate;
      completionByUser.set(row.user_id, entry);
    }

    const eligible = completedUsers.filter((user) => {
      if (!user.user_id) return false;
      const c = completionByUser.get(user.user_id);
      if (!c || c.count < TOTAL_LESSONS) return false;
      const twoDaysAfter = new Date(c.lastCompletedAt.getTime() + TIMING.review.afterCompletion);
      return now >= twoDaysAfter;
    });

    const suppressed = await getSuppressedEmails(eligible.map((u) => u.user_email));
    const reqSuccesses = await runPool(eligible, SEND_CONCURRENCY, async (user) => {
      if (suppressed.has((user.user_email || '').toLowerCase())) return null;
      if (await isPaused(user.user_id)) return null; // P1-6
      const sent = await sendReviewRequest(user.user_email, user.customer_name || 'there');
      if (!sent) {
        errors.push('review email failed');
        return null;
      }
      return user.user_email;
    });
    reviewSuccesses.push(...reqSuccesses);
    if (reviewSuccesses.length > 0) {
      const { error: uErr } = await supabase
        .from('purchases')
        .update({ review_requested: true, review_requested_at: now.toISOString() })
        .in('user_email', reviewSuccesses);
      if (uErr) errors.push(`review batch update: ${uErr.message}`);
    }
  }

  // ── Review nudge: 4 days after first review request ──
  const fourDaysAgo = new Date(now.getTime() - TIMING.review.nudgeAfterRequest).toISOString();

  const { data: nudgeUsers, error: nqErr } = await supabase
    .from('purchases')
    .select('user_email, user_id, customer_name')
    .eq('review_requested', true)
    .eq('review_nudge_sent', false)
    .lte('review_requested_at', fourDaysAgo)
    .limit(1000);

  if (nqErr) errors.push(`nudge query: ${nqErr.message}`);

  const nudgeSuccesses: string[] = [];
  if (nudgeUsers && nudgeUsers.length > 0) {
    const suppressed = await getSuppressedEmails(nudgeUsers.map((u) => u.user_email));
    const nSuccesses = await runPool(nudgeUsers, SEND_CONCURRENCY, async (user) => {
      if (suppressed.has((user.user_email || '').toLowerCase())) return null;
      if (await isPaused(user.user_id)) return null; // P1-6
      // P3-4 / R3-EMAIL-5: send the real first name, not the 'there' sentinel.
      const sent = await sendReviewNudge(user.user_email, user.customer_name || 'there');
      if (!sent) {
        errors.push('nudge email failed');
        return null;
      }
      return user.user_email;
    });
    nudgeSuccesses.push(...nSuccesses);
    if (nudgeSuccesses.length > 0) {
      const { error: nuErr } = await supabase
        .from('purchases')
        .update({ review_nudge_sent: true })
        .in('user_email', nudgeSuccesses);
      if (nuErr) errors.push(`nudge batch update: ${nuErr.message}`);
    }
  }

  if (errors.length > 0) console.error('[cron/review] Errors:', errors);
  return NextResponse.json({
    reviewsSent: reviewSuccesses.length,
    nudgesSent: nudgeSuccesses.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
