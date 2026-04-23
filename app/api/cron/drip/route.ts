export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendDay3Email, sendDay7Email } from '@/lib/email';
import { TIMING } from '@/lib/config';
import { verifyCronAuth } from '@/lib/cron-auth';

export async function GET(request: Request) {
  const authErr = verifyCronAuth(request);
  if (authErr) return authErr;

  const supabase = createAdminClient();
  const now = new Date();
  let day3Sent = 0;
  let day7Sent = 0;
  const errors: string[] = [];

  // ── Day 3 emails ──
  const threeDaysAgo = new Date(now.getTime() - TIMING.drip.day3.after).toISOString();
  const fourDaysAgo = new Date(now.getTime() - TIMING.drip.day3.after - TIMING.drip.day3.window).toISOString();

  const { data: day3Users, error: day3Err } = await supabase
    .from('purchases')
    .select('user_email, plan, customer_name')
    .eq('status', 'active')
    .eq('day3_sent', false)
    .gte('purchased_at', fourDaysAgo)
    .lte('purchased_at', threeDaysAgo)
    .limit(500);

  if (day3Err) {
    errors.push(`day3 query: ${day3Err.message}`);
  } else if (day3Users && day3Users.length > 0) {
    const day3Successes: string[] = [];
    await Promise.all(
      day3Users.map(async (user) => {
        const sent = await sendDay3Email(user.user_email, user.customer_name || 'there');
        if (sent) day3Successes.push(user.user_email);
        else errors.push('day3 email failed');
      })
    );
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
    .select('user_email, plan, customer_name')
    .eq('status', 'active')
    .eq('day7_sent', false)
    .gte('purchased_at', eightDaysAgo)
    .lte('purchased_at', sevenDaysAgo)
    .limit(500);

  if (day7Err) {
    errors.push(`day7 query: ${day7Err.message}`);
  } else if (day7Users && day7Users.length > 0) {
    const day7Successes: string[] = [];
    await Promise.all(
      day7Users.map(async (user) => {
        const sent = await sendDay7Email(user.user_email, user.customer_name || 'there');
        if (sent) day7Successes.push(user.user_email);
        else errors.push('day7 email failed');
      })
    );
    if (day7Successes.length > 0) {
      const { error: updateErr } = await supabase
        .from('purchases')
        .update({ day7_sent: true })
        .in('user_email', day7Successes);
      if (updateErr) errors.push(`day7 batch update: ${updateErr.message}`);
      else day7Sent = day7Successes.length;
    }
  }

  if (errors.length > 0) console.error('[cron/drip] Errors:', errors);
  return NextResponse.json({ day3Sent, day7Sent, errors: errors.length > 0 ? errors : undefined });
}
