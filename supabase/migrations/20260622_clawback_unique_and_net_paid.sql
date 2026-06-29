-- Audit remediation — adversarial-review fixes for the clawback subsystem.
-- AUDIT: apply in the Supabase SQL editor (no DATABASE_URL). Idempotent.
--
-- 1) Review #1 (CRITICAL): the webhook's clawback INSERT had no uniqueness, and
--    a refunded/disputed paid attribution stays 'paid', so EVERY Stripe
--    re-delivery of charge.refunded / charge.dispute.created inserted ANOTHER
--    clawback row for the same already-paid commission — over-clawing the
--    affiliate by N×. This unique index makes the insert an idempotent upsert
--    (ignoreDuplicates), so a redelivery is a no-op. (attribution_id is the
--    natural key; reason distinguishes a later dispute from the earlier refund.)
create unique index if not exists uq_commission_clawbacks_attr_reason
  on public.commission_clawbacks (attribution_id, reason)
  where attribution_id is not null;

-- 2) Review #2: affiliate_payouts.total_commission_cents stores GROSS, but when
--    a clawback nets the payout down only net_paid_cents actually transfers via
--    Stripe. Record net separately so the dashboard + 1099 reconciliation read
--    what was really paid (gross stays for the commission-earned figure).
alter table public.affiliate_payouts
  add column if not exists net_paid_cents integer;
