export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendDropoff5d, sendDropoff10d, sendDropoff21d } from '@/lib/email';

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

  // ── 5-day drop-off ──
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();

  const { data: dropoff5 } = await supabase
    .from('purchases')
    .select('user_email, user_id')
    .eq('status', 'active')
    .eq('dropoff_5d_sent', false)
    .lte('purchased_at', fiveDaysAgo);

  if (dropoff5) {
    for (const user of dropoff5) {
      // Check if user has been active recently
      const { data: progress } = await supabase
        .from('course_progress')
        .select('lesson_id, updated_at')
        .eq('user_id', user.user_id)
        .order('updated_at', { ascending: false })
        .limit(1);

      const lastActivity = progress?.[0]?.updated_at;
      if (lastActivity && new Date(lastActivity) > new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)) {
        continue; // User is still active, skip
      }

      // Check if user completed all courses
      const { count } = await supabase
        .from('course_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user_id)
        .eq('is_completed', true);

      if (count && count >= 12) continue; // Completed everything, skip

      const lastLesson = progress?.[0]?.lesson_id || '1';

      try {
        await sendDropoff5d(user.user_email, 'there', lastLesson, `Lesson ${lastLesson}`);
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
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();

  const { data: dropoff10 } = await supabase
    .from('purchases')
    .select('user_email, user_id')
    .eq('status', 'active')
    .eq('dropoff_10d_sent', false)
    .lte('purchased_at', tenDaysAgo);

  if (dropoff10) {
    for (const user of dropoff10) {
      const { data: progress } = await supabase
        .from('course_progress')
        .select('lesson_id, updated_at')
        .eq('user_id', user.user_id)
        .order('updated_at', { ascending: false })
        .limit(1);

      const lastActivity = progress?.[0]?.updated_at;
      if (lastActivity && new Date(lastActivity) > new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)) {
        continue;
      }

      const { count } = await supabase
        .from('course_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user_id)
        .eq('is_completed', true);

      if (count && count >= 12) continue;

      try {
        await sendDropoff10d(user.user_email, 'there');
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
  const twentyOneDaysAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString();

  const { data: dropoff21 } = await supabase
    .from('purchases')
    .select('user_email, user_id')
    .eq('status', 'active')
    .eq('dropoff_21d_sent', false)
    .lte('purchased_at', twentyOneDaysAgo);

  if (dropoff21) {
    for (const user of dropoff21) {
      const { data: progress } = await supabase
        .from('course_progress')
        .select('lesson_id, updated_at')
        .eq('user_id', user.user_id)
        .order('updated_at', { ascending: false })
        .limit(1);

      const lastActivity = progress?.[0]?.updated_at;
      if (lastActivity && new Date(lastActivity) > new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000)) {
        continue;
      }

      const { count } = await supabase
        .from('course_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user_id)
        .eq('is_completed', true);

      if (count && count >= 12) continue;

      const lastLesson = progress?.[0]?.lesson_id || '1';

      try {
        await sendDropoff21d(user.user_email, 'there', lastLesson);
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

  return NextResponse.json({ d5Sent, d10Sent, d21Sent });
}
