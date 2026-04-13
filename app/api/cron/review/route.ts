export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendReviewRequest, sendReviewNudge } from '@/lib/email';
import { TIMING, TOTAL_LESSONS } from '@/lib/config';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  let reviewsSent = 0;
  let nudgesSent = 0;

  // ── Review request: 2 days after completing all 12 lessons ──
  // Find users who completed all 12 but haven't been sent a review request
  const { data: completedUsers } = await supabase
    .from('purchases')
    .select('user_email, user_id, customer_name')
    .eq('status', 'active')
    .eq('review_requested', false);

  if (completedUsers && completedUsers.length > 0) {
    // Batch-fetch all progress for candidate users in one query
    const userIds = [...new Set(completedUsers.map((u) => u.user_id).filter(Boolean))];
    const { data: allProgress } = await supabase
      .from('course_progress')
      .select('user_id, is_completed, updated_at')
      .in('user_id', userIds)
      .eq('is_completed', true);

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

      try {
        await sendReviewRequest(user.user_email, user.customer_name || 'there');
        await supabase
          .from('purchases')
          .update({ review_requested: true, review_requested_at: now.toISOString() })
          .eq('user_email', user.user_email);
        reviewsSent++;
      } catch (err) {
        console.error(`Review request failed for ${user.user_email}:`, err);
      }
    }
  }

  // ── Review nudge: 4 days after first review request, if no response ──
  const fourDaysAgo = new Date(now.getTime() - TIMING.review.nudgeAfterRequest).toISOString();

  const { data: nudgeUsers } = await supabase
    .from('purchases')
    .select('user_email')
    .eq('review_requested', true)
    .eq('review_nudge_sent', false)
    .lte('review_requested_at', fourDaysAgo);

  if (nudgeUsers) {
    for (const user of nudgeUsers) {
      try {
        await sendReviewNudge(user.user_email, 'there');
        await supabase
          .from('purchases')
          .update({ review_nudge_sent: true })
          .eq('user_email', user.user_email);
        nudgesSent++;
      } catch (err) {
        console.error(`Review nudge failed for ${user.user_email}:`, err);
      }
    }
  }

  return NextResponse.json({ reviewsSent, nudgesSent });
}
