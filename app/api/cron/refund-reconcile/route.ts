export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

import { createAdminClient } from '@/utils/supabase/admin';
import { getStripe } from '@/lib/stripe-connect';
import { applyRefundToCharge } from '@/lib/refunds';
import { verifyCronAuth } from '@/lib/cron-auth';

// AUDIT (§5): catch refunds whose `charge.refunded` webhook was dropped (Stripe
// exhausts its retries, or the handler errored). Re-applies the SAME idempotent
// refund logic (lib/refunds.ts) for every refund in the lookback window — a
// no-op when the webhook already handled it, a repair when it didn't.
//
// Schedule is OFF for cost (vercel.json crons are empty). Run it manually with
// the cron secret, or wire it into vercel.json at launch.
const LOOKBACK_DAYS = 7;
const MAX_CHARGES = 1000; // safety cap so a misconfigured window can't run away.

export async function GET(request: Request) {
  const authErr = verifyCronAuth(request);
  if (authErr) return authErr;

  const stripe = getStripe();
  const admin = createAdminClient();
  const sinceSec = Math.floor(Date.now() / 1000) - LOOKBACK_DAYS * 24 * 60 * 60;

  let chargesSeen = 0;
  let reconciled = 0;
  const errors: string[] = [];
  const seenCharges = new Set<string>();

  try {
    // Auto-paginate recent refunds; each carries its (expanded) charge. One
    // charge can have several refunds — dedupe so we apply it once.
    for await (const refund of stripe.refunds.list({
      created: { gte: sinceSec },
      limit: 100,
      expand: ['data.charge'],
    })) {
      const charge = refund.charge;
      if (!charge || typeof charge === 'string') continue;
      if (seenCharges.has(charge.id)) continue;
      seenCharges.add(charge.id);
      chargesSeen++;
      if (chargesSeen > MAX_CHARGES) {
        errors.push(`hit MAX_CHARGES (${MAX_CHARGES}); window too wide`);
        break;
      }
      try {
        const outcome = await applyRefundToCharge(admin, stripe, charge);
        if (outcome.purchaseId) reconciled++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${charge.id}: ${msg}`);
        Sentry.captureException(err, {
          extra: { handler: 'refund-reconcile', chargeId: charge.id },
        });
      }
    }
  } catch (err) {
    Sentry.captureException(err, { extra: { handler: 'refund-reconcile', step: 'list' } });
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'refund list failed' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, chargesSeen, reconciled, errors });
}
