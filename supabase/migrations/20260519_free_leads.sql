-- Free-asset lead capture.
-- Captures emails dropped into the /free/* reciprocity assets so we can
-- (a) re-mail the asset to users who lose the original tab, and
-- (b) build a win-back/at-risk surface in admin without dumping Resend
-- logs into a spreadsheet.
--
-- Server-only writes via service role; no public reads. Per founder
-- direction 2026-05-19 (Phase 2 of the H build).

create table if not exists free_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null,                  -- e.g. 'manager-archetype-map'
  role text,                              -- 'ae' | 'sdr' | null at capture
  captured_at timestamptz not null default now(),

  -- Request metadata for de-dup + abuse triage
  ip_hash text,
  user_agent text,
  referrer text,

  -- Outbound delivery state
  delivered_at timestamptz,
  delivery_error text,

  -- Downstream conversion link (filled when this email later purchases)
  converted_purchase_id uuid
);

create unique index if not exists free_leads_email_source_idx
  on free_leads (lower(email), source);

create index if not exists free_leads_captured_at_idx
  on free_leads (captured_at desc);

create index if not exists free_leads_source_idx
  on free_leads (source);

alter table free_leads enable row level security;
