-- Bump the consumer-side affiliate commission from 30% to 40%.
--
-- Ratified 2026-06-01. The 40% rate is what the affiliate kit, the
-- outreach drafts, and the partnerships OS all promise. Before this
-- migration the live DB still defaulted to 30% and the Stripe webhook
-- computed 30% (lib/affiliate.ts DEFAULT_COMMISSION_RATE, bumped to 0.4
-- in the same change). This migration aligns the schema defaults AND
-- the existing rows so nobody enrolled before today earns at the old
-- rate.
--
-- Two tables carry a commission number:
--   affiliate_backend.affiliate_links.commission_rate  numeric  (0.30 -> 0.40)
--   affiliates.commission_pct                           numeric(5,2) (30.00 -> 40.00)

begin;

-- 1) affiliate_links (20260519_affiliate_backend.sql)
alter table affiliate_links
  alter column commission_rate set default 0.40;

update affiliate_links
  set commission_rate = 0.40
  where commission_rate = 0.30;

-- 2) affiliates (20260522_affiliates_entity.sql)
alter table affiliates
  alter column commission_pct set default 40.00;

update affiliates
  set commission_pct = 40.00
  where commission_pct = 30.00;

commit;

-- Verify (run after commit):
--   select distinct commission_rate from affiliate_links;   -- expect 0.40
--   select distinct commission_pct  from affiliates;        -- expect 40.00
