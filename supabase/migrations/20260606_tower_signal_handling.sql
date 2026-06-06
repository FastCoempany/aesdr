-- Tower: let a signal leave the decision board once the operator acts on it.
-- Additive only — companion to 20260605_partner_agent_infra.sql and the /tower
-- surface. partner_signals gains a handled marker so the board shows only what
-- still needs a gesture; everything else is the read-only situational feed.

alter table partner_signals add column if not exists handled_at timestamptz;
alter table partner_signals add column if not exists handled_by text;

-- The board's hot query: unhandled signals, newest first.
create index if not exists partner_signals_unhandled_idx
  on partner_signals (created_at desc) where handled_at is null;
