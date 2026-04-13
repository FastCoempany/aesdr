export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendDropoff5d, sendDropoff10d, sendDropoff21d } from '@/lib/email';
import { TIMING, TOTAL_LESSONS } from '@/lib/config';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  let d5Sent = 0;
  let d10Sent = 0;
  let d21Sent = 0;

  // ── Gather all candidate users for any tier of dropoff ──
  const fiveDaysAgo = new Date(now.getTime() - TIMING.dropoff.d5).toISOString();

  const { data: allDropoffCandidates } = await supabase
    .from('purchases')
    .select('user_email, user_id, customer_name, dropoff_5d_sent, dropoff_10d_sent, dropoff_21d_sent, purchased_at')
    .eq('status', 'active')
    .lte('purchased_at', fiveDaysAgo)
    .or('dropoff_5d_sent.eq.false,dropoff_10d_sent.eq.false,dropoff_21d_sent.eq.false');

  if (allDropoffCandidates && allDropoffCandidates.length > 0) {
    // Batch-fetch progress for ALL candidate users in one query
    const userIds = [...new Set(allDropoffCandidates.map((u) => u.user_id).filter(Boolean))];
    const { data: allProgress } = await supabase
      .from('course_progress')
      .select('user_id, lesson_id, is_completed, updated_at')
      .in('user_id', userIds);

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
          try {
            await sendDropoff5d(user.user_email, user.customer_name || 'there', lastLesson, `Lesson ${lastLesson}`);
            await supabase
              .from('purchases')
              .update({ dropoff_5d_sent: true })
              .eq('user_email', user.user_email);
            d5Sent++;
          } catch (err) {
            console.error(`Dropoff 5d email failed for ${user.user_email}:`, err);
          }
        }
      }

      // ── 10-day drop-off ──
      if (!user.dropoff_10d_sent && purchasedDate <= tenDaysAgo) {
        if (!lastActiveDate || lastActiveDate <= tenDaysAgo) {
          try {
            await sendDropoff10d(user.user_email, user.customer_name || 'there');
            await supabase
              .from('purchases')
              .update({ dropoff_10d_sent: true })
              .eq('user_email', user.user_email);
            d10Sent++;
          } catch (err) {
            console.error(`Dropoff 10d email failed for ${user.user_email}:`, err);
          }
        }
      }

      // ── 21-day drop-off ──
      if (!user.dropoff_21d_sent && purchasedDate <= twentyOneDaysAgo) {
        if (!lastActiveDate || lastActiveDate <= twentyOneDaysAgo) {
          try {
            await sendDropoff21d(user.user_email, user.customer_name || 'there', lastLesson);
            await supabase
              .from('purchases')
              .update({ dropoff_21d_sent: true })
              .eq('user_email', user.user_email);
            d21Sent++;
          } catch (err) {
            console.error(`Dropoff 21d email failed for ${user.user_email}:`, err);
          }
        }
      }
    }
  }

  return NextResponse.json({ d5Sent, d10Sent, d21Sent });
}
