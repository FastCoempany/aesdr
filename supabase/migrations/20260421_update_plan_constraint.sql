-- Expand purchases.plan constraint to accept the split tiers (sdr, ae)
-- in addition to the legacy values (individual, team). Legacy rows remain valid.
ALTER TABLE public.purchases DROP CONSTRAINT IF EXISTS purchases_plan_check;
ALTER TABLE public.purchases ADD CONSTRAINT purchases_plan_check
  CHECK (plan IN ('individual', 'sdr', 'ae', 'team'));
