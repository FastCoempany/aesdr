export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendDropoff5d, sendDropoff10d, sendDropoff21d } from '@/lib/email';
import { TIMING, TOTAL_LESSONS } from '@/lib/config';
import { verifyCronAuth } from '@/lib/cron-auth';

export async function GET(request: Request) {
  const authErr = verifyCronAuth(request);
  if (authErr) return authErr;

  const supabase = createAdminClient();
  const now = new Date();
  let d5Sent = 0;
  let d10Sent = 0;
  let d21Sent = 0;
  const errors: string[] = [];

  // ── Gather all candidate users for any tier of dropoff ──
  const fiveDaysAgo = new Date(now.getTime() - TIMING.dropoff.d5).toISOString();

  const { data: allDropoffCandidates, error: queryErr } = await supabase
    .from('purchases')
    .select('user_email, user_id, customer_name, dropoff_5d_sent, dropoff_10d_sent, dropoff_21d_sent, purchased_at')
    .eq('status', 'active')
    .lte('purchased_at', fiveDaysAgo)
    .or('dropoff_5d_sent.eq.false,dropoff_10d_sent.eq.false,dropoff_21d_sent.eq.false');

  if (queryErr) {
    errors.push(`dropoff query: ${queryErr.message}`);
  } else if (allDropoffCandidates && allDropoffCandidates.length > 0) {
    // Batch-fetch progress for ALL candidate users in one query
    const userIds = [...new Set(allDropoffCandidates.map((u) => u.user_id).filter(Boolean))];
    const { data: allProgress, error: progressErr } = await supabase
      .from('course_progress')
      .select('user_id, lesson_id, is_completed, updated_at')
      .in('user_id', userIds);

    if (progressErr) {
      errors.push(`progress query: ${progressErr.message}`);
    }

    // Build lookup maps
    const progressByUser = new Map<string, typeof allProgress>();
    for (const row of allProgress ?? []) {
      const existing = progressByUser.get(row.user_id) ?? [];
      existing.push(row);
      progressByUser.set(row.user_id, existing);
    }

    function getUserActivity(userId: string) {
      const rows = progressByUser.get(userId) ?? [];
      const sorted = [...rows].sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
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

    for (const user of allDropoffCandidates) {
      if (!user.user_id) continue;
      const { lastActivity, lastLesson, completedAll } = getUserActivity(user.user_id);

      // Skip if completed all courses
      if (completedAll) continue;

      const lastActiveDate = lastActivity ? new Date(lastActivity) : null;
      const purchasedDate = new Date(user.purchased_at);

      // ── 5-day drop-off ──
      if (!user.dropoff_5d_sent && purchasedDate <= fiveDaysAgoDate) {
        if (!lastActiveDate || lastActiveDate <= fiveDaysAgoDate) {
          const sent = await sendDropoff5d(user.user_email, user.customer_name || 'there', lastLesson, `Lesson ${lastLesson}`);
          if (!sent) { errors.push(`5d email failed for ${user.user_email}`); }
          else {
            const { error: u5 } = await supabase
              .from('purchases')
              .update({ dropoff_5d_sent: true })
              .eq('user_email', user.user_email);
            if (u5) errors.push(`5d update ${user.user_email}: ${u5.message}`);
            else d5Sent++;
          }
        }
      }

      // ── 10-day drop-off ──
      if (!user.dropoff_10d_sent && purchasedDate <= tenDaysAgo) {
        if (!lastActiveDate || lastActiveDate <= tenDaysAgo) {
          const sent = await sendDropoff10d(user.user_email, user.customer_name || 'there');
          if (!sent) { errors.push(`10d email failed for ${user.user_email}`); }
          else {
            const { error: u10 } = await supabase
              .from('purchases')
              .update({ dropoff_10d_sent: true })
              .eq('user_email', user.user_email);
            if (u10) errors.push(`10d update ${user.user_email}: ${u10.message}`);
            else d10Sent++;
          }
        }
      }

      // ── 21-day drop-off ──
      if (!user.dropoff_21d_sent && purchasedDate <= twentyOneDaysAgo) {
        if (!lastActiveDate || lastActiveDate <= twentyOneDaysAgo) {
          const sent = await sendDropoff21d(user.user_email, user.customer_name || 'there', lastLesson);
          if (!sent) { errors.push(`21d email failed for ${user.user_email}`); }
          else {
            const { error: u21 } = await supabase
              .from('purchases')
              .update({ dropoff_21d_sent: true })
              .eq('user_email', user.user_email);
            if (u21) errors.push(`21d update ${user.user_email}: ${u21.message}`);
            else d21Sent++;
          }
        }
      }
    }
  }

  if (errors.length > 0) Sentry.captureMessage('[cron/dropoff] Errors', { level: 'error', extra: { errors } });
  return NextResponse.json({ d5Sent, d10Sent, d21Sent, errors: errors.length > 0 ? errors : undefined });
}
