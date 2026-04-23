export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendReviewRequest, sendReviewNudge } from '@/lib/email';
import { TIMING, TOTAL_LESSONS } from '@/lib/config';
import { verifyCronAuth } from '@/lib/cron-auth';

export async function GET(request: Request) {
  const authErr = verifyCronAuth(request);
  if (authErr) return authErr;

  const supabase = createAdminClient();
  const now = new Date();
  const errors: string[] = [];

  // ── Review request: 2 days after completing all 12 lessons ──
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

    await Promise.all(
      eligible.map(async (user) => {
        const sent = await sendReviewRequest(user.user_email, user.customer_name || 'there');
        if (sent) reviewSuccesses.push(user.user_email);
        else errors.push('review email failed');
      })
    );
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
    .select('user_email')
    .eq('review_requested', true)
    .eq('review_nudge_sent', false)
    .lte('review_requested_at', fourDaysAgo)
    .limit(1000);

  if (nqErr) errors.push(`nudge query: ${nqErr.message}`);

  const nudgeSuccesses: string[] = [];
  if (nudgeUsers && nudgeUsers.length > 0) {
    await Promise.all(
      nudgeUsers.map(async (user) => {
        const sent = await sendReviewNudge(user.user_email, 'there');
        if (sent) nudgeSuccesses.push(user.user_email);
        else errors.push('nudge email failed');
      })
    );
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
