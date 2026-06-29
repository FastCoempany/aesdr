-- Audit remediation P0-2 (decision #31): the clawback ledger. When a sale whose
-- commission was ALREADY PAID OUT is refunded or lost to a dispute, the money is
-- gone -- flipping the attribution status can't recover it. We record the amount
-- owed back here; runAffiliatePayoutBatch nets open rows against the affiliate's
-- next payout (oldest first; a clawback larger than the next payout is applied
-- partially and the remainder carries forward).
--
-- AUDIT: apply in the Supabase SQL editor (no DATABASE_URL). Idempotent.

create table if not exists public.commission_clawbacks (
  id                uuid primary key default gen_random_uuid(),
  affiliate_slug    text not null,
  attribution_id    uuid,            -- the paid attribution being clawed back
  purchase_id       uuid,
  amount_cents      integer not null check (amount_cents > 0),  -- remaining owed back
  reason            text not null,   -- 'refund' | 'dispute'
  applied_payout_id uuid,            -- set when fully netted against a payout
  applied_at        timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists idx_commission_clawbacks_open
  on public.commission_clawbacks(affiliate_slug)
  where applied_payout_id is null;

alter table public.commission_clawbacks enable row level security;
-- Service-role only (webhook writes, payout batch reads/updates via admin client).
