-- Adversarial final pass 2026-06-29 — FIX (HIGH, money): commission clawback
-- re-inflation on webhook redelivery / reconcile re-run.
--
-- `commission_clawbacks.amount_cents` is the OPEN (un-netted) balance — a partial
-- payout decrements it to the remainder (applyClawbacks → app/actions/affiliate.ts
-- sets amount_cents = remainder). But the refund/dispute handlers recomputed the
-- pro-rata TARGET from Stripe's unchanged cumulative refund and took
-- GREATEST(amount_cents, target). On a Stripe redelivery (at-least-once) or the
-- reconcile cron re-running applyRefundToCharge, that GREATEST read the DECREMENTED
-- remainder and raised it back to the full target — resurrecting the portion a
-- payout had already consumed and double-clawing the affiliate.
--
-- Fix: track the high-water mark of total clawback ever recognized in a separate
-- column. The handlers now raise `original_amount_cents` monotonically and add only
-- the GROWTH to the open `amount_cents` (see lib/payout-math.ts:mergeRecognizedClawback),
-- so a redelivery is a true no-op and an incremental partial refund only adds its
-- delta. The cap (refund + dispute ≤ commission) also reads this high-water, not
-- the live remainder.
--
-- Apply in the Supabase SQL editor BEFORE the deploy that ships the new handler
-- code — the upserts now include original_amount_cents and will error 'column not
-- found' until this runs (the handlers Sentry-log + continue, so a refund clawback
-- would silently not write, i.e. the affiliate would be overpaid).

alter table public.commission_clawbacks
  add column if not exists original_amount_cents integer;

-- Backfill existing rows: the best available estimate of the high-water mark is
-- the current amount_cents. A pre-existing partially-netted row loses the
-- already-consumed portion from its high-water — but that's the SAFE direction:
-- on a future redelivery it can only UNDER-recognize (never re-inflate), and the
-- merge helper is monotonic from there.
update public.commission_clawbacks
  set original_amount_cents = amount_cents
  where original_amount_cents is null;
