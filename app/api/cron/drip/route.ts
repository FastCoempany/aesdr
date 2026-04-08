export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendDay3Email, sendDay7Email } from '@/lib/email';

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  let day3Sent = 0;
  let day7Sent = 0;

  // ── Day 3 emails ──
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString();

  const { data: day3Users } = await supabase
    .from('purchases')
    .select('user_email, plan')
    .eq('status', 'active')
    .eq('day3_sent', false)
    .gte('purchased_at', fourDaysAgo)
    .lte('purchased_at', threeDaysAgo);

  if (day3Users) {
    for (const user of day3Users) {
      try {
        await sendDay3Email(user.user_email, 'there');
        await supabase
          .from('purchases')
          .update({ day3_sent: true })
          .eq('user_email', user.user_email);
        day3Sent++;
      } catch (err) {
        console.error(`Day3 email failed for ${user.user_email}:`, err);
      }
    }
  }

  // ── Day 7 emails ──
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString();

  const { data: day7Users } = await supabase
    .from('purchases')
    .select('user_email, plan')
    .eq('status', 'active')
    .eq('day7_sent', false)
    .gte('purchased_at', eightDaysAgo)
    .lte('purchased_at', sevenDaysAgo);

  if (day7Users) {
    for (const user of day7Users) {
      try {
        await sendDay7Email(user.user_email, 'there');
        await supabase
          .from('purchases')
          .update({ day7_sent: true })
          .eq('user_email', user.user_email);
        day7Sent++;
      } catch (err) {
        console.error(`Day7 email failed for ${user.user_email}:`, err);
      }
    }
  }

  return NextResponse.json({ day3Sent, day7Sent });
}
