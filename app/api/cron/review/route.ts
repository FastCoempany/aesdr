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
  let reviewsSent = 0;
  let nudgesSent = 0;
  const errors: string[] = [];

  // ── Review request: 2 days after completing all 12 lessons ──
  // Find users who completed all 12 but haven't been sent a review request
  const { data: completedUsers, error: qErr } = await supabase
    .from('purchases')
    .select('user_email, user_id, customer_name')
    .eq('status', 'active')
    .eq('review_requested', false);

  if (qErr) {
    errors.push(`review query: ${qErr.message}`);
  } else if (completedUsers && completedUsers.length > 0) {
    // Batch-fetch all progress for candidate users in one query
    const userIds = [...new Set(completedUsers.map((u) => u.user_id).filter(Boolean))];
    const { data: allProgress, error: pErr } = await supabase
      .from('course_progress')
      .select('user_id, is_completed, updated_at')
      .in('user_id', userIds)
      .eq('is_completed', true);

    if (pErr) errors.push(`progress query: ${pErr.message}`);

    // Build per-user completion maps
    const completionByUser = new Map<string, { count: number; lastCompletedAt: Date }>();
    for (const row of allProgress ?? []) {
      const entry = completionByUser.get(row.user_id) ?? { count: 0, lastCompletedAt: new Date(0) };
      entry.count++;
      const rowDate = new Date(row.updated_at);
      if (rowDate > entry.lastCompletedAt) entry.lastCompletedAt = rowDate;
      completionByUser.set(row.user_id, entry);
    }

    for (const user of completedUsers) {
      if (!user.user_id) continue;
      const completion = completionByUser.get(user.user_id);
      if (!completion || completion.count < TOTAL_LESSONS) continue;

      const twoDaysAfter = new Date(completion.lastCompletedAt.getTime() + TIMING.review.afterCompletion);
      if (now < twoDaysAfter) continue;

      const sent = await sendReviewRequest(user.user_email, user.customer_name || 'there');
      if (!sent) {
        errors.push(`review email failed for ${user.user_email}`);
        continue;
      }
      const { error: uErr } = await supabase
        .from('purchases')
        .update({ review_requested: true, review_requested_at: now.toISOString() })
        .eq('user_email', user.user_email);
      if (uErr) errors.push(`review update ${user.user_email}: ${uErr.message}`);
      else reviewsSent++;
    }
  }

  // ── Review nudge: 4 days after first review request, if no response ──
  const fourDaysAgo = new Date(now.getTime() - TIMING.review.nudgeAfterRequest).toISOString();

  const { data: nudgeUsers, error: nqErr } = await supabase
    .from('purchases')
    .select('user_email')
    .eq('review_requested', true)
    .eq('review_nudge_sent', false)
    .lte('review_requested_at', fourDaysAgo);

  if (nqErr) {
    errors.push(`nudge query: ${nqErr.message}`);
  } else if (nudgeUsers) {
    for (const user of nudgeUsers) {
      const sent = await sendReviewNudge(user.user_email, 'there');
      if (!sent) {
        errors.push(`nudge email failed for ${user.user_email}`);
        continue;
      }
      const { error: nuErr } = await supabase
        .from('purchases')
        .update({ review_nudge_sent: true })
        .eq('user_email', user.user_email);
      if (nuErr) errors.push(`nudge update ${user.user_email}: ${nuErr.message}`);
      else nudgesSent++;
    }
  }

  if (errors.length > 0) console.error('[cron/review] Errors:', errors);
  return NextResponse.json({ reviewsSent, nudgesSent, errors: errors.length > 0 ? errors : undefined });
}
