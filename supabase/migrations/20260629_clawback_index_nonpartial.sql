-- Adversarial re-audit 2026-06-29 — FIX (HIGH, money): the clawback unique index
-- was PARTIAL (`WHERE attribution_id is not null`). PostgreSQL will NOT use a
-- partial index for ON CONFLICT arbiter inference unless the statement restates
-- the predicate, and supabase-js only emits `ON CONFLICT (attribution_id,
-- reason)`. So every clawback upsert (refund + dispute) errored with 42P10, wrote
-- NOTHING (the handlers only Sentry-log + continue), and the affiliate was
-- overpaid full commission on every refunded/disputed paid sale.
--
-- attribution_id is always set in both upserts, and a standard unique index
-- already treats NULLs as distinct — so a NON-partial index is equivalent for
-- real rows AND is inferable by `ON CONFLICT (attribution_id, reason)`.
-- Apply in the Supabase SQL editor.

drop index if exists public.uq_commission_clawbacks_attr_reason;

create unique index if not exists uq_commission_clawbacks_attr_reason
  on public.commission_clawbacks (attribution_id, reason);
