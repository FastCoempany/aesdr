export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendDay3Email, sendDay7Email } from '@/lib/email';
import { TIMING } from '@/lib/config';
import { verifyCronAuth } from '@/lib/cron-auth';
import { isPausedUser } from '@/app/actions/pause';

// R4-PERF-7 / R5-DV: Resend's API is rate-limited (~2 req/s). Firing the whole
// cohort through Promise.all bursts past it, and safeSend has no 429 retry, so
// once a cohort is more than a few dozen the overflow silently drops. Run the
// sends through a small fixed-size pool instead. Each worker returns the email
// only on a TRUE send so a false/429 never sets the *_sent flag.
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
  let day3Sent = 0;
  let day7Sent = 0;
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

  // ── Day 3 emails ──
  const threeDaysAgo = new Date(now.getTime() - TIMING.drip.day3.after).toISOString();
  const fourDaysAgo = new Date(now.getTime() - TIMING.drip.day3.after - TIMING.drip.day3.window).toISOString();

  const { data: day3Users, error: day3Err } = await supabase
    .from('purchases')
    .select('user_email, user_id, plan, customer_name')
    .eq('status', 'active')
    .eq('day3_sent', false)
    .gte('purchased_at', fourDaysAgo)
    .lte('purchased_at', threeDaysAgo)
    .limit(500);

  if (day3Err) {
    errors.push(`day3 query: ${day3Err.message}`);
  } else if (day3Users && day3Users.length > 0) {
    const day3Successes = await runPool(day3Users, SEND_CONCURRENCY, async (user) => {
      if (await isPaused(user.user_id)) return null;
      const sent = await sendDay3Email(user.user_email, user.customer_name || 'there');
      if (!sent) {
        errors.push('day3 email failed');
        return null;
      }
      return user.user_email;
    });
    if (day3Successes.length > 0) {
      const { error: updateErr } = await supabase
        .from('purchases')
        .update({ day3_sent: true })
        .in('user_email', day3Successes);
      if (updateErr) errors.push(`day3 batch update: ${updateErr.message}`);
      else day3Sent = day3Successes.length;
    }
  }

  // ── Day 7 emails ──
  const sevenDaysAgo = new Date(now.getTime() - TIMING.drip.day7.after).toISOString();
  const eightDaysAgo = new Date(now.getTime() - TIMING.drip.day7.after - TIMING.drip.day7.window).toISOString();

  const { data: day7Users, error: day7Err } = await supabase
    .from('purchases')
    .select('user_email, user_id, plan, customer_name')
    .eq('status', 'active')
    .eq('day7_sent', false)
    .gte('purchased_at', eightDaysAgo)
    .lte('purchased_at', sevenDaysAgo)
    .limit(500);

  if (day7Err) {
    errors.push(`day7 query: ${day7Err.message}`);
  } else if (day7Users && day7Users.length > 0) {
    const day7Successes = await runPool(day7Users, SEND_CONCURRENCY, async (user) => {
      if (await isPaused(user.user_id)) return null;
      const sent = await sendDay7Email(user.user_email, user.customer_name || 'there');
      if (!sent) {
        errors.push('day7 email failed');
        return null;
      }
      return user.user_email;
    });
    if (day7Successes.length > 0) {
      const { error: updateErr } = await supabase
        .from('purchases')
        .update({ day7_sent: true })
        .in('user_email', day7Successes);
      if (updateErr) errors.push(`day7 batch update: ${updateErr.message}`);
      else day7Sent = day7Successes.length;
    }
  }

  if (errors.length > 0) Sentry.captureMessage('[cron/drip] Errors', { level: 'error', extra: { errors } });
  return NextResponse.json({ day3Sent, day7Sent, errors: errors.length > 0 ? errors : undefined });
}
