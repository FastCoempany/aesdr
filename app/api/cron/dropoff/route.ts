export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendDropoff5d, sendDropoff10d, sendDropoff21d, getSuppressedEmails } from '@/lib/email';
import { TIMING, TOTAL_LESSONS } from '@/lib/config';
import { verifyCronAuth } from '@/lib/cron-auth';
import { isPausedUser } from '@/app/actions/pause';
import { LESSONS } from '@/utils/progress/types';

// R4-PERF-7: bounded send pool to respect Resend's ~2 req/s limit; only a TRUE
// send returns the email, so a false/429 never sets the *_sent flag.
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

// Lesson id → human title (R4-DR-…): the drop-off emails should name the
// lesson the buyer stopped at, not "Lesson 7".
const LESSON_TITLE = new Map(LESSONS.map((l) => [l.id, l.title]));
function lessonTitleFor(lessonId: string): string {
  return LESSON_TITLE.get(lessonId) ?? `Lesson ${lessonId}`;
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

  const fiveDaysAgo = new Date(now.getTime() - TIMING.dropoff.d5).toISOString();

  const { data: allDropoffCandidates, error: queryErr } = await supabase
    .from('purchases')
    .select('user_email, user_id, customer_name, dropoff_5d_sent, dropoff_10d_sent, dropoff_21d_sent, purchased_at')
    .eq('status', 'active')
    .lte('purchased_at', fiveDaysAgo)
    .or('dropoff_5d_sent.eq.false,dropoff_10d_sent.eq.false,dropoff_21d_sent.eq.false')
    .limit(1000);

  if (queryErr) {
    errors.push(`dropoff query: ${queryErr.message}`);
    return NextResponse.json({ d5Sent: 0, d10Sent: 0, d21Sent: 0, errors });
  }

  if (!allDropoffCandidates || allDropoffCandidates.length === 0) {
    return NextResponse.json({ d5Sent: 0, d10Sent: 0, d21Sent: 0 });
  }

  const userIds = [...new Set(allDropoffCandidates.map((u) => u.user_id).filter(Boolean))];
  const { data: allProgress, error: progressErr } = await supabase
    .from('course_progress')
    .select('user_id, lesson_id, is_completed, updated_at')
    .in('user_id', userIds);

  if (progressErr) errors.push(`progress query: ${progressErr.message}`);

  const progressByUser = new Map<string, typeof allProgress>();
  for (const row of allProgress ?? []) {
    const existing = progressByUser.get(row.user_id) ?? [];
    existing.push(row);
    progressByUser.set(row.user_id, existing);
  }

  function getUserActivity(userId: string) {
    const rows = progressByUser.get(userId) ?? [];
    const sorted = [...rows].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    const completedCount = rows.filter((r) => r.is_completed).length;
    return {
      lastActivity: sorted[0]?.updated_at ?? null,
      lastLesson: sorted[0]?.lesson_id ?? '1',
      completedAll: completedCount >= TOTAL_LESSONS,
    };
  }

  const tenDaysAgo = new Date(now.getTime() - TIMING.dropoff.d10);
  const twentyOneDaysAgo = new Date(now.getTime() - TIMING.dropoff.d21);
  const fiveDaysAgoDate = new Date(now.getTime() - TIMING.dropoff.d5);

  // Partition work into tier-specific batches. Emails sent in parallel,
  // updates applied in one batched query per tier.
  const tier5: { email: string; name: string; lesson: string }[] = [];
  const tier10: { email: string; name: string }[] = [];
  const tier21: { email: string; name: string; lesson: string }[] = [];

  for (const user of allDropoffCandidates) {
    if (!user.user_id) continue;
    if (await isPaused(user.user_id)) continue; // P1-6
    const { lastActivity, lastLesson, completedAll } = getUserActivity(user.user_id);
    if (completedAll) continue;

    const lastActiveDate = lastActivity ? new Date(lastActivity) : null;
    const purchasedDate = new Date(user.purchased_at);

    if (!user.dropoff_5d_sent && purchasedDate <= fiveDaysAgoDate) {
      if (!lastActiveDate || lastActiveDate <= fiveDaysAgoDate) {
        tier5.push({ email: user.user_email, name: user.customer_name || 'there', lesson: lastLesson });
      }
    }
    if (!user.dropoff_10d_sent && purchasedDate <= tenDaysAgo) {
      if (!lastActiveDate || lastActiveDate <= tenDaysAgo) {
        tier10.push({ email: user.user_email, name: user.customer_name || 'there' });
      }
    }
    if (!user.dropoff_21d_sent && purchasedDate <= twentyOneDaysAgo) {
      if (!lastActiveDate || lastActiveDate <= twentyOneDaysAgo) {
        tier21.push({ email: user.user_email, name: user.customer_name || 'there', lesson: lastLesson });
      }
    }
  }

  // Sequential across tiers + bounded within each tier, so the total Resend
  // request rate stays under the limit (R4-PERF-7). A false send returns null
  // and never marks the tier flag.
  // P0-12: don't bulk-mail unsubscribed addresses.
  const suppressed = await getSuppressedEmails([...tier5, ...tier10, ...tier21].map((t) => t.email));
  const d5Successes = await runPool(tier5, SEND_CONCURRENCY, async (t) => {
    if (suppressed.has((t.email || '').toLowerCase())) return null;
    const ok = await sendDropoff5d(t.email, t.name, t.lesson, lessonTitleFor(t.lesson));
    return ok ? t.email : null;
  });
  const d10Successes = await runPool(tier10, SEND_CONCURRENCY, async (t) => {
    if (suppressed.has((t.email || '').toLowerCase())) return null;
    const ok = await sendDropoff10d(t.email, t.name);
    return ok ? t.email : null;
  });
  const d21Successes = await runPool(tier21, SEND_CONCURRENCY, async (t) => {
    if (suppressed.has((t.email || '').toLowerCase())) return null;
    const ok = await sendDropoff21d(t.email, t.name, t.lesson);
    return ok ? t.email : null;
  });

  // One batched update per tier.
  await Promise.all([
    d5Successes.length
      ? supabase.from('purchases').update({ dropoff_5d_sent: true }).in('user_email', d5Successes)
      : Promise.resolve({ error: null }),
    d10Successes.length
      ? supabase.from('purchases').update({ dropoff_10d_sent: true }).in('user_email', d10Successes)
      : Promise.resolve({ error: null }),
    d21Successes.length
      ? supabase.from('purchases').update({ dropoff_21d_sent: true }).in('user_email', d21Successes)
      : Promise.resolve({ error: null }),
  ]);

  const emailsFailed =
    tier5.length - d5Successes.length +
    (tier10.length - d10Successes.length) +
    (tier21.length - d21Successes.length);
  if (emailsFailed > 0) errors.push(`${emailsFailed} email send(s) failed`);

  if (errors.length > 0) console.error('[cron/dropoff] Errors:', errors);
  return NextResponse.json({
    d5Sent: d5Successes.length,
    d10Sent: d10Successes.length,
    d21Sent: d21Successes.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
