export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
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
    .lte('purchased_at', threeDaysAgo);

  if (day3Err) {
    errors.push(`day3 query: ${day3Err.message}`);
  } else if (day3Users) {
    for (const user of day3Users) {
      const sent = await sendDay3Email(user.user_email, user.customer_name || 'there');
      if (!sent) {
        errors.push(`day3 email failed for ${user.user_email}`);
        continue;
      }
      const { error: updateErr } = await supabase
        .from('purchases')
        .update({ day3_sent: true })
        .eq('user_email', user.user_email);
      if (updateErr) {
        errors.push(`day3 update ${user.user_email}: ${updateErr.message}`);
      } else {
        day3Sent++;
      }
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
    .lte('purchased_at', sevenDaysAgo);

  if (day7Err) {
    errors.push(`day7 query: ${day7Err.message}`);
  } else if (day7Users) {
    for (const user of day7Users) {
      const sent = await sendDay7Email(user.user_email, user.customer_name || 'there');
      if (!sent) {
        errors.push(`day7 email failed for ${user.user_email}`);
        continue;
      }
      const { error: updateErr } = await supabase
        .from('purchases')
        .update({ day7_sent: true })
        .eq('user_email', user.user_email);
      if (updateErr) {
        errors.push(`day7 update ${user.user_email}: ${updateErr.message}`);
      } else {
        day7Sent++;
      }
    }
  }

  if (errors.length > 0) Sentry.captureMessage('[cron/drip] Errors', { level: 'error', extra: { errors } });
  return NextResponse.json({ day3Sent, day7Sent, errors: errors.length > 0 ? errors : undefined });
}
