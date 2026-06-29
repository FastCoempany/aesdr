-- Audit remediation (Round 1-5 patch run).
-- 1) Widen affiliate_attributions.status so the payout atomic-claim ('processing')
--    and the self-referral guard ('self_referral') don't violate the CHECK.
--    WITHOUT this, runAffiliatePayoutBatch throws on the claim and the batch
--    aborts BEFORE any transfer (fails safe -- no money moves -- but payouts
--    won't run). See P0-1 / decision #3.
-- 2) Add affiliate_applications.applicant_email (the apply form now collects it
--    so applicants can be acknowledged -- P1-7). The insert fails until this exists.
--
-- AUDIT: apply this in the Supabase SQL editor (no DATABASE_URL available to the
-- patch run). Idempotent.

-- Robust to the constraint's actual name: drop ANY check constraint on this
-- table that references the status column (a blind drop-by-assumed-name would
-- leave a differently-named old constraint in force, ANDing with the new one
-- and still rejecting 'processing'/'self_referral' -> payouts still fail).
do $$
declare r record;
begin
  for r in
    select conname from pg_constraint
    where conrelid = 'public.affiliate_attributions'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.affiliate_attributions drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.affiliate_attributions
  add constraint affiliate_attributions_status_check
  check (status in ('pending','cleared','paid','refunded','processing','self_referral'));

alter table public.affiliate_applications
  add column if not exists applicant_email text;
