/**
 * Pure payout/clawback math — extracted from runAffiliatePayoutBatch so it can
 * be unit-tested (the netting is exactly where money bugs hide).
 *
 * AUDIT (P0-2 adversarial review #3/#4): the previous inline version compared
 * the `full` flag against a possibly-null `amount_cents` and could mark a row
 * applied with amount 0 (violating the > 0 CHECK after the transfer already
 * went out). This version coerces the amount, skips non-positive rows, and
 * returns explicit per-row application records the caller persists atomically.
 */

export interface OpenClawback {
  id: string;
  amount_cents: number | null;
}

export interface ClawbackApplication {
  id: string;
  /** true → fully consumed (close the row); false → partial (decrement remainder). */
  full: boolean;
  /** remaining cents still owed back after this payout (0 when fully applied). */
  remaining: number;
  /** how many cents this payout consumed from the row (for auditing). */
  applied: number;
}

export interface NettingResult {
  /** cents to actually transfer this payout (gross minus clawbacks consumed). */
  netCents: number;
  /** total clawback consumed by this payout. */
  clawbackTotal: number;
  /** per-row instructions: close (full) or decrement (partial). */
  applications: ClawbackApplication[];
}

/**
 * Net open clawbacks against this payout's gross commission, oldest-first
 * (caller orders the array). A clawback larger than the gross is applied
 * partially; the remainder carries to the next payout. Once `net` hits 0 the
 * loop stops, leaving later clawbacks untouched.
 */
export function applyClawbacks(
  grossCents: number,
  openClawbacks: OpenClawback[],
): NettingResult {
  let net = Math.max(0, Math.round(grossCents));
  const applications: ClawbackApplication[] = [];

  for (const cb of openClawbacks) {
    if (net <= 0) break;
    const amt = Math.max(0, Math.round(cb.amount_cents ?? 0));
    if (amt <= 0) continue; // defensive: the column is CHECK (> 0), but never trust the read
    const applied = Math.min(net, amt);
    net -= applied;
    applications.push({
      id: cb.id,
      full: applied === amt,
      remaining: amt - applied,
      applied,
    });
  }

  return {
    netCents: net,
    clawbackTotal: Math.max(0, Math.round(grossCents)) - net,
    applications,
  };
}

/**
 * Pro-rata commission clawback for a (possibly partial) refund — decision #28:
 * a partial refund reduces the affiliate's commission in proportion to the
 * refunded fraction; a full refund claws back the whole commission.
 *
 * `refundedCents` is Stripe's CUMULATIVE `amount_refunded` for the charge, so
 * feeding each `charge.refunded` event through this is monotonic across
 * incremental partial refunds — the caller takes GREATEST(existing, result) so
 * a later/larger refund only ever raises the clawback, and a webhook redelivery
 * is a no-op. Result is clamped to [0, commission] and never negative.
 */
export function proRataClawbackCents(
  commissionCents: number,
  refundedCents: number,
  capturedCents: number,
): number {
  const commission = Math.max(0, Math.round(commissionCents));
  const refunded = Math.max(0, Math.round(refundedCents));
  const captured = Math.max(0, Math.round(capturedCents));
  if (commission === 0 || captured === 0 || refunded === 0) return 0;
  if (refunded >= captured) return commission; // full (or over-) refund
  return Math.min(commission, Math.round((commission * refunded) / captured));
}
