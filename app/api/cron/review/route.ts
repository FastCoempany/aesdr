export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendReviewRequest, sendReviewNudge } from '@/lib/email';

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
    .select('user_email, user_id')
    .eq('status', 'active')
    .eq('review_requested', false);

  if (completedUsers) {
    for (const user of completedUsers) {
      // Count completed lessons
      const { count } = await supabase
        .from('course_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user_id)
        .eq('is_completed', true);

      if (!count || count < 12) continue;

      // Get when the last lesson was completed
      const { data: lastCompleted } = await supabase
        .from('course_progress')
        .select('updated_at')
        .eq('user_id', user.user_id)
        .eq('is_completed', true)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (!lastCompleted?.[0]) continue;

      const completedAt = new Date(lastCompleted[0].updated_at);
      const twoDaysAfter = new Date(completedAt.getTime() + 2 * 24 * 60 * 60 * 1000);

      if (now < twoDaysAfter) continue; // Not yet 2 days since completion

      try {
        await sendReviewRequest(user.user_email, 'there');
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
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString();

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
