-- Audit remediation P0-12 / R5-DV-2: a suppression list so unsubscribes and
-- Resend bounce/complaint events actually stop future bulk sends. The lifecycle
-- crons must check this before sending (AUDIT: wire the .not('email','in',...)
-- / NOT EXISTS guard into drip/dropoff/review/abandonment/retention queries).
-- The /unsubscribe route writes here. Apply in the Supabase SQL editor.

create table if not exists public.email_suppressions (
  email       text primary key,
  reason      text not null default 'unsubscribe',  -- unsubscribe | bounce | complaint
  created_at  timestamptz not null default now()
);

-- Service-role only (crons + the unsubscribe route use the admin client).
alter table public.email_suppressions enable row level security;
