-- Partner-agent infrastructure: the tables the new agents (sentinel, courier,
-- usher) read and write. Companion to docs/partnerships/new-agents-wiring.md
-- and the agent specs in .claude/agents/{sentinel,courier,usher}.md.
--
-- Same posture as 20260601_affiliate_prospect_tracking.sql: RLS enabled with
-- NO public policies. Only the service role (utils/supabase/admin.ts) and the
-- partnerships psql creds touch these tables. Anon/auth roles get nothing.
--
-- Additive only — every statement is `if not exists`, so re-running is safe and
-- nothing existing is altered or dropped.

-- ─── partner_inbound_email ───  (sentinel reads; the inbound webhook writes)
-- One row per reply that lands in affiliates@. Written by
-- app/api/webhooks/inbound-email. Sentinel polls processed_at IS NULL.
-- text_body is PLAIN TEXT ONLY and is treated as untrusted data, never executed.
create table if not exists partner_inbound_email (
  id            uuid primary key default gen_random_uuid(),
  message_id    text unique,
  in_reply_to   text,
  from_addr     text not null,
  to_addr       text not null,
  subject       text,
  text_body     text,
  received_at   timestamptz not null default now(),
  processed_at  timestamptz,
  classification text,
  matched_pipeline_id uuid
);
create index if not exists partner_inbound_unprocessed_idx
  on partner_inbound_email (received_at) where processed_at is null;

-- ─── partner_outbound_queue ───  (scribe/herald/usher write; operator approves; courier sends)
-- The work queue AND the [D] approval surface. A nurture ladder is a set of
-- rows here with future send_after values. courier never writes the body.
create table if not exists partner_outbound_queue (
  id            uuid primary key default gen_random_uuid(),
  to_addr       text not null,
  subject       text not null,
  body          text not null,
  tier          text not null check (tier in ('transactional','sequenced','cold')),
  status        text not null default 'draft'
                  check (status in ('draft','ready','approved','held','sent','failed')),
  warden_cleared boolean not null default false,
  approved_by   text,
  approved_at   timestamptz,
  send_after    timestamptz not null default now(),
  idempotency_key text not null unique,
  related_pipeline_id uuid,
  drafted_by    text,
  created_at    timestamptz not null default now(),
  sent_at       timestamptz,
  resend_id     text,
  error         text
);
create index if not exists partner_outbound_due_idx
  on partner_outbound_queue (send_after)
  where status in ('ready','approved');

-- ─── partner_sent_log ───  (courier append-only; the immutable audit trail)
-- The unique idempotency_key index is the hard double-send guard.
create table if not exists partner_sent_log (
  id            uuid primary key default gen_random_uuid(),
  queue_id      uuid not null,
  to_addr       text not null,
  subject       text,
  tier          text not null,
  idempotency_key text not null,
  resend_id     text,
  model         text,
  sent_at       timestamptz not null default now()
);
create unique index if not exists partner_sent_log_idem_idx
  on partner_sent_log (idempotency_key);

-- ─── agent_cursors ───  (sentinel's poll position; survives restarts)
create table if not exists agent_cursors (
  agent       text not null,
  stream      text not null,
  cursor_ts   timestamptz,
  cursor_id   uuid,
  updated_at  timestamptz not null default now(),
  primary key (agent, stream)
);

-- ─── partner_signals ───  (sentinel's alert dedup + record)
-- unique(signal_type, ref_id) means the same source event can never alert twice.
create table if not exists partner_signals (
  id            uuid primary key default gen_random_uuid(),
  signal_type   text not null,
  source        text not null,
  ref_id        text not null,
  prospect_slug text,
  severity      text not null check (severity in ('bright','soft')),
  summary       text,
  alerted_at    timestamptz,
  alert_channel text,
  created_at    timestamptz not null default now(),
  unique (signal_type, ref_id)
);

-- ─── partner_workshop ───  (usher's lifecycle state)
create table if not exists partner_workshop (
  id            uuid primary key default gen_random_uuid(),
  affiliate_slug text not null,
  scheduled_at  timestamptz not null,
  status        text not null default 'scheduled'
                  check (status in ('scheduled','reminded','live','replay_open','closed')),
  replay_url    text,
  replay_expires_at timestamptz,
  registrant_count int not null default 0,
  created_at    timestamptz not null default now()
);

-- Lock all six to the service role only (no policies on purpose).
alter table partner_inbound_email   enable row level security;
alter table partner_outbound_queue  enable row level security;
alter table partner_sent_log        enable row level security;
alter table agent_cursors           enable row level security;
alter table partner_signals         enable row level security;
alter table partner_workshop        enable row level security;
