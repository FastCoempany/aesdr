export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendAbandon1hr, sendAbandon24hr } from '@/lib/email';
import { TIMING } from '@/lib/config';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  let hr1Sent = 0;
  let hr24Sent = 0;

  // ── 1-hour abandonment emails ──
  const oneHourAgo = new Date(now.getTime() - TIMING.abandonment.hr1.after).toISOString();
  const twoHoursAgo = new Date(now.getTime() - TIMING.abandonment.hr1.after - TIMING.abandonment.hr1.window).toISOString();

  const { data: abandon1hr } = await supabase
    .from('checkout_sessions')
    .select('user_email, session_id')
    .eq('completed', false)
    .is('abandon_1hr_sent', null)
    .gte('started_at', twoHoursAgo)
    .lte('started_at', oneHourAgo);

  if (abandon1hr) {
    // The initial query already filters completed=false, so no need to re-check
    // each row individually. Use a conditional update to guard against race conditions.
    for (const row of abandon1hr) {
      try {
        await sendAbandon1hr(row.user_email);
        // Only mark sent if still incomplete (atomic guard)
        await supabase
          .from('checkout_sessions')
          .update({ abandon_1hr_sent: now.toISOString() })
          .eq('session_id', row.session_id)
          .eq('completed', false);
        hr1Sent++;
      } catch (err) {
        console.error(`Abandon 1hr email failed for ${row.user_email}:`, err);
      }
    }
  }

  // ── 24-hour abandonment emails ──
  const oneDayAgo = new Date(now.getTime() - TIMING.abandonment.hr24.after).toISOString();
  const twoDaysAgo = new Date(now.getTime() - TIMING.abandonment.hr24.after - TIMING.abandonment.hr24.window).toISOString();

  const { data: abandon24hr } = await supabase
    .from('checkout_sessions')
    .select('user_email, session_id')
    .eq('completed', false)
    .is('abandon_24hr_sent', null)
    .gte('started_at', twoDaysAgo)
    .lte('started_at', oneDayAgo);

  if (abandon24hr) {
    for (const row of abandon24hr) {
      try {
        await sendAbandon24hr(row.user_email);
        await supabase
          .from('checkout_sessions')
          .update({ abandon_24hr_sent: now.toISOString() })
          .eq('session_id', row.session_id)
          .eq('completed', false);
        hr24Sent++;
      } catch (err) {
        console.error(`Abandon 24hr email failed for ${row.user_email}:`, err);
      }
    }
  }

  return NextResponse.json({ hr1Sent, hr24Sent });
}
