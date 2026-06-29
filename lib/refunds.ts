import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import * as Sentry from '@sentry/nextjs';

import { proRataClawbackCents } from '@/lib/payout-math';

export interface RefundOutcome {
  purchaseId: string | null;
  isFullRefund: boolean;
  /** number of attribution rows a pro-rata clawback was written for. */
  clawbacksWritten: number;
}

/**
 * Apply a Stripe `charge.refunded` to our books — pro-rata commission clawback
 * (decision #28) plus access revocation on a full refund. Extracted from the
 * webhook so the refund-reconciliation cron (audit §5) can replay the SAME logic
 * for any refund whose webhook was dropped. It is IDEMPOTENT: clawbacks use
 * GREATEST(existing, target) and the status flips are no-ops on a second run, so
 * calling it twice for the same charge changes nothing.
 *
 * §9  'processing' attributions (mid-payout, claimed by an in-flight batch) are
 *     clawed back like 'paid' ones — the money is about to move, so a refund
 *     must still net the affiliate's next payout.
 * §10 a payment_intent can carry more than one checkout session (a retried or
 *     expired one before the paid session); match the session that actually has
 *     a purchase row instead of blindly taking the first.
 */
export async function applyRefundToCharge(
  supabase: SupabaseClient,
  stripe: Stripe,
  charge: Stripe.Charge,
): Promise<RefundOutcome> {
  if (!charge.payment_intent) {
    return { purchaseId: null, isFullRefund: false, clawbacksWritten: 0 };
  }

  const capturedCents = charge.amount_captured || charge.amount || 0;
  const refundedCents = charge.amount_refunded || 0;
  const isFullRefund = capturedCents > 0 && refundedCents >= capturedCents;

  // §10: pull several sessions for the PI and match the one with a purchase row.
  const sessions = await stripe.checkout.sessions.list({
    payment_intent: charge.payment_intent as string,
    limit: 10,
  });
  let purchaseId: string | null = null;
  for (const s of sessions.data) {
    const { data: p } = await supabase
      .from('purchases')
      .select('id')
      .eq('stripe_session_id', s.id)
      .maybeSingle();
    if (p?.id) {
      purchaseId = p.id;
      break;
    }
  }
  if (!purchaseId) {
    return { purchaseId: null, isFullRefund, clawbacksWritten: 0 };
  }
  const pid = purchaseId;

  const { data: attrs } = await supabase
    .from('affiliate_attributions')
    .select('id, affiliate_slug, commission_amount_cents, status')
    .eq('purchase_id', pid);

  // §9: paid OR processing → clawback (money is out or about to go out).
  const clawable = (attrs ?? []).filter(
    (a) =>
      (a.status === 'paid' || a.status === 'processing') &&
      (a.commission_amount_cents ?? 0) > 0,
  );
  // pending/cleared are not-yet-paid; reduce them pro-rata on a partial, or
  // withdraw them entirely on a full refund.
  const unpaid = (attrs ?? []).filter(
    (a) => a.status === 'pending' || a.status === 'cleared',
  );

  // Read-then-GREATEST-then-upsert a pro-rata 'refund' clawback. Overwrites to
  // max(existing, target) so a redelivery / reconcile re-run / smaller
  // out-of-order event never LOWERS an existing clawback.
  const writeProRataClawbacks = async (
    rows: { id: string; affiliate_slug: string | null; commission_amount_cents: number | null }[],
    label: string,
  ): Promise<number> => {
    if (rows.length === 0) return 0;
    const ids = rows.map((a) => a.id);
    // Read existing refund AND dispute clawbacks for these attributions. The
    // refund amount uses GREATEST(existing refund, pro-rata target) for
    // idempotency, then is capped so refund + any existing dispute clawback can
    // never exceed the commission (#5 — a sale that's both refunded and disputed
    // must be clawed back at most once; the dispute handler caps the reciprocal).
    const { data: existing } = await supabase
      .from('commission_clawbacks')
      .select('attribution_id, amount_cents, reason')
      .in('reason', ['refund', 'dispute'])
      .in('attribution_id', ids);
    const refundMap = new Map<string, number>();
    const disputeMap = new Map<string, number>();
    for (const r of existing ?? []) {
      if (r.reason === 'refund') refundMap.set(r.attribution_id, r.amount_cents ?? 0);
      else if (r.reason === 'dispute') disputeMap.set(r.attribution_id, r.amount_cents ?? 0);
    }
    const upsertRows = rows
      .map((a) => {
        const commission = a.commission_amount_cents ?? 0;
        const target = proRataClawbackCents(commission, refundedCents, capturedCents);
        const greatest = Math.max(refundMap.get(a.id) ?? 0, target);
        const amount = Math.min(greatest, Math.max(0, commission - (disputeMap.get(a.id) ?? 0)));
        return {
          affiliate_slug: a.affiliate_slug,
          attribution_id: a.id,
          purchase_id: pid,
          amount_cents: amount,
          reason: 'refund',
        };
      })
      .filter((r) => r.amount_cents > 0);
    if (upsertRows.length === 0) return 0;
    const { error: cbErr } = await supabase
      .from('commission_clawbacks')
      .upsert(upsertRows, { onConflict: 'attribution_id,reason' });
    if (cbErr) {
      Sentry.captureMessage(`[refund] clawback ledger upsert failed (${label})`, {
        level: 'error',
        extra: { purchaseId: pid, error: cbErr.message },
      });
    }
    return upsertRows.length;
  };

  let clawbacksWritten = await writeProRataClawbacks(clawable, 'refund, paid/processing');

  if (isFullRefund) {
    const { error: pErr } = await supabase
      .from('purchases')
      .update({ status: 'refunded' })
      .eq('id', pid);
    if (pErr) console.error('[refund] purchase status update failed:', pErr.message);

    if (unpaid.length > 0) {
      const unpaidIds = unpaid.map((a) => a.id);
      // Not-yet-paid commission is simply withdrawn, not clawed back.
      await supabase
        .from('affiliate_attributions')
        .update({ status: 'refunded', refunded_at: new Date().toISOString() })
        .in('id', unpaidIds);
      // An excluded (refunded + unpaid) attribution must NOT carry a clawback —
      // it would net against the affiliate's OTHER payouts. Drop any pro-rata
      // clawback written while this was still partial.
      await supabase
        .from('commission_clawbacks')
        .delete()
        .eq('reason', 'refund')
        .in('attribution_id', unpaidIds);
    }
  } else {
    // Partial refund: keep access; reduce not-yet-paid commission pro-rata via
    // the same ledger so the next payout nets it.
    clawbacksWritten += await writeProRataClawbacks(unpaid, 'refund, partial unpaid');
  }

  return { purchaseId: pid, isFullRefund, clawbacksWritten };
}
