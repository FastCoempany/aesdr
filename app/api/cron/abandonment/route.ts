export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendAbandon1hr, sendAbandon24hr } from '@/lib/email';
import { TIMING } from '@/lib/config';
import { verifyCronAuth } from '@/lib/cron-auth';

export async function GET(request: Request) {
  const authErr = verifyCronAuth(request);
  if (authErr) return authErr;

  const supabase = createAdminClient();
  const now = new Date();
  const errors: string[] = [];

  // ── 1-hour abandonment emails ──
  const oneHourAgo = new Date(now.getTime() - TIMING.abandonment.hr1.after).toISOString();
  const twoHoursAgo = new Date(now.getTime() - TIMING.abandonment.hr1.after - TIMING.abandonment.hr1.window).toISOString();

  const { data: abandon1hr, error: q1Err } = await supabase
    .from('checkout_sessions')
    .select('user_email, session_id')
    .eq('completed', false)
    .is('abandon_1hr_sent', null)
    .gte('started_at', twoHoursAgo)
    .lte('started_at', oneHourAgo)
    .limit(500);

  if (q1Err) errors.push(`1hr query: ${q1Err.message}`);

  const hr1Successes: string[] = [];
  if (abandon1hr && abandon1hr.length > 0) {
    await Promise.all(
      abandon1hr.map(async (row) => {
        const sent = await sendAbandon1hr(row.user_email);
        if (sent) hr1Successes.push(row.session_id);
        else errors.push('1hr email failed');
      })
    );
    if (hr1Successes.length > 0) {
      const { error: updateErr } = await supabase
        .from('checkout_sessions')
        .update({ abandon_1hr_sent: now.toISOString() })
        .in('session_id', hr1Successes)
        .eq('completed', false);
      if (updateErr) errors.push(`1hr batch update: ${updateErr.message}`);
    }
  }

  // ── 24-hour abandonment emails ──
  const oneDayAgo = new Date(now.getTime() - TIMING.abandonment.hr24.after).toISOString();
  const twoDaysAgo = new Date(now.getTime() - TIMING.abandonment.hr24.after - TIMING.abandonment.hr24.window).toISOString();

  const { data: abandon24hr, error: q24Err } = await supabase
    .from('checkout_sessions')
    .select('user_email, session_id')
    .eq('completed', false)
    .is('abandon_24hr_sent', null)
    .gte('started_at', twoDaysAgo)
    .lte('started_at', oneDayAgo)
    .limit(500);

  if (q24Err) errors.push(`24hr query: ${q24Err.message}`);

  const hr24Successes: string[] = [];
  if (abandon24hr && abandon24hr.length > 0) {
    await Promise.all(
      abandon24hr.map(async (row) => {
        const sent = await sendAbandon24hr(row.user_email);
        if (sent) hr24Successes.push(row.session_id);
        else errors.push('24hr email failed');
      })
    );
    if (hr24Successes.length > 0) {
      const { error: updateErr } = await supabase
        .from('checkout_sessions')
        .update({ abandon_24hr_sent: now.toISOString() })
        .in('session_id', hr24Successes)
        .eq('completed', false);
      if (updateErr) errors.push(`24hr batch update: ${updateErr.message}`);
    }
  }

  if (errors.length > 0) console.error('[cron/abandonment] Errors:', errors);
  return NextResponse.json({
    hr1Sent: hr1Successes.length,
    hr24Sent: hr24Successes.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
