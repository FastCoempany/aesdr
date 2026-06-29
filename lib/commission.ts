/**
 * Single source of truth for affiliate commission math.
 *
 * Per the Round-4 money audit (R4-MON-2 / decision #1 + #27): the webhook
 * must derive commission from the affiliate's own `commission_pct` column
 * (not a hardcoded constant), compute it once, and store the exact rate used
 * on the attribution row. Centralizing it here keeps the webhook, calculator,
 * kit, and the D22 agreement deriving from the same function.
 *
 * Base: net of Stripe processing fees where the fee is resolvable; falls back
 * to gross when it isn't (see computeCommissionCents).
 */

// AUDIT (R4-MON-2/#1/#27): single source of truth for the commission rate +
// base. Default rate is 30%; the webhook overrides per-affiliate from
// affiliates.commission_pct.
/** Default commission rate when an affiliate row has no usable commission_pct. */
export const DEFAULT_COMMISSION_RATE = 0.3;

/**
 * Resolve the commission rate to use for an attribution.
 *
 * `affiliates.commission_pct` is stored as a percentage (numeric(5,2),
 * e.g. 30.00 or 40.00), so values > 1 are normalized to a fraction. A
 * fractional value (≤ 1, e.g. 0.30) is accepted as-is for forward-compat.
 * Anything missing / non-finite / non-positive falls back to the default.
 *
 * @param commissionPct the affiliate's stored commission_pct (or null/undefined)
 */
export function resolveCommissionRate(
  commissionPct: number | null | undefined
): number {
  if (commissionPct == null || !Number.isFinite(commissionPct) || commissionPct <= 0) {
    return DEFAULT_COMMISSION_RATE;
  }
  // Stored as a percent (30.00) → fraction (0.30). Already-fractional passes through.
  const rate = commissionPct > 1 ? commissionPct / 100 : commissionPct;
  // AUDIT (§14): real commission rates are never ≤1% and never ≥100% for anyone,
  // so a value resolving into that band is a misconfiguration — e.g. a stored `1`
  // is ambiguous (1%? 100%?) and used to slip through as 100%. Fall back to the
  // default instead of paying an absurd amount. Real rates (0.20–0.40 / 20–40)
  // resolve cleanly into (0.01, 1).
  if (rate <= 0.01 || rate >= 1) return DEFAULT_COMMISSION_RATE;
  return rate;
}

/**
 * Compute commission in integer cents from a base amount and a rate.
 * Rounds half-up to the nearest cent. Never returns negative.
 *
 * @param baseCents the commission base in cents (net-of-fees where available)
 * @param rate the commission rate as a fraction (e.g. 0.30)
 */
export function computeCommissionCents(baseCents: number, rate: number): number {
  if (!Number.isFinite(baseCents) || baseCents <= 0) return 0;
  if (!Number.isFinite(rate) || rate <= 0) return 0;
  return Math.max(0, Math.round(baseCents * rate));
}
