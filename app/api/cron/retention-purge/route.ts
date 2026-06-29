export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

import { createAdminClient } from '@/utils/supabase/admin';
import { verifyCronAuth } from '@/lib/cron-auth';

// AUDIT (R4-LEG-7 / R5-PI-4 / R5-PI-9): data-minimization purge for the scraped
// prospect data — the highest-PII data we hold about people who never consented.
// Founder decision 2026-06-29: we keep a candidate only while they're an active
// prospect.
//   • never-contacted (sourced/enriched) older than 90 days → delete
//   • dead (passed/cold) older than 30 days → delete
// We KEEP anything mid-relationship or converted (contacted → activated).
//
// Deliberately NOT purged here: financial/tax records (7-yr legal hold), the
// events log (founder: indefinite; PII already scrubbed), course progress +
// artifacts (deleted with the account, see /account/data), email_suppressions
// (compliance), and affiliate_clicks (low-PII hashed IPs, and FK-referenced by
// the retained financial attributions).
//
// Schedule is OFF for cost — run manually with the cron secret, or wire into
// vercel.json at launch.
const DAY = 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const authErr = verifyCronAuth(request);
  if (authErr) return authErr;

  const admin = createAdminClient();
  const now = Date.now();
  const result: Record<string, number | string> = {};

  // Never-contacted candidates older than 90 days.
  try {
    const cut90 = new Date(now - 90 * DAY).toISOString();
    const { data, error } = await admin
      .from('partner_pipeline')
      .delete()
      .in('status', ['sourced', 'enriched'])
      .lt('created_at', cut90)
      .select('id');
    if (error) throw error;
    result.pipeline_uncontacted_90d = data?.length ?? 0;
  } catch (err) {
    Sentry.captureException(err, { extra: { handler: 'retention-purge', step: 'pipeline_uncontacted' } });
    result.pipeline_uncontacted_error = err instanceof Error ? err.message : String(err);
  }

  // Dead candidates (passed/cold) older than 30 days.
  try {
    const cut30 = new Date(now - 30 * DAY).toISOString();
    const { data, error } = await admin
      .from('partner_pipeline')
      .delete()
      .in('status', ['passed', 'cold'])
      .lt('updated_at', cut30)
      .select('id');
    if (error) throw error;
    result.pipeline_dead_30d = data?.length ?? 0;
  } catch (err) {
    Sentry.captureException(err, { extra: { handler: 'retention-purge', step: 'pipeline_dead' } });
    result.pipeline_dead_error = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json({ ok: true, ...result });
}
