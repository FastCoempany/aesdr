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
  let hr1Sent = 0;
  let hr24Sent = 0;
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
    .lte('started_at', oneHourAgo);

  if (q1Err) {
    errors.push(`1hr query: ${q1Err.message}`);
  } else if (abandon1hr) {
    for (const row of abandon1hr) {
      const sent = await sendAbandon1hr(row.user_email);
      if (!sent) {
        errors.push(`1hr email failed for ${row.user_email}`);
        continue;
      }
      const { error: updateErr } = await supabase
        .from('checkout_sessions')
        .update({ abandon_1hr_sent: now.toISOString() })
        .eq('session_id', row.session_id)
        .eq('completed', false);
      if (updateErr) {
        errors.push(`1hr update ${row.session_id}: ${updateErr.message}`);
      } else {
        hr1Sent++;
      }
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
    .lte('started_at', oneDayAgo);

  if (q24Err) {
    errors.push(`24hr query: ${q24Err.message}`);
  } else if (abandon24hr) {
    for (const row of abandon24hr) {
      const sent = await sendAbandon24hr(row.user_email);
      if (!sent) {
        errors.push(`24hr email failed for ${row.user_email}`);
        continue;
      }
      const { error: updateErr } = await supabase
        .from('checkout_sessions')
        .update({ abandon_24hr_sent: now.toISOString() })
        .eq('session_id', row.session_id)
        .eq('completed', false);
      if (updateErr) {
        errors.push(`24hr update ${row.session_id}: ${updateErr.message}`);
      } else {
        hr24Sent++;
      }
    }
  }

  if (errors.length > 0) console.error('[cron/abandonment] Errors:', errors);
  return NextResponse.json({ hr1Sent, hr24Sent, errors: errors.length > 0 ? errors : undefined });
}
