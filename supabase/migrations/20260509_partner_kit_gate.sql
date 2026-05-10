-- Partner kit gate — token issuance + access logs.
-- Per founder direction 2026-05-09: partner-private kit docs (full canon
-- excerpt, claims grid, pricing math, promo templates, day-by-day cadence,
-- lesson-level curriculum) ship via per-partner signed URL with audit trail.
--
-- Issuance: founder mints a token row → URL with HMAC-signed payload
-- {tid, exp} → partner clicks → server verifies sig + expiry + revoked_at
-- → sets session cookie → access logged on every page view.
--
-- Server-only writes via service role; no RLS policies needed.

create table if not exists partner_kit_tokens (
  id uuid primary key default gen_random_uuid(),
  partner_slug text not null,
  partner_label text,
  notes text,

  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  revoked_reason text
);

create index if not exists partner_kit_tokens_partner_slug_idx
  on partner_kit_tokens (partner_slug);
create index if not exists partner_kit_tokens_issued_at_idx
  on partner_kit_tokens (issued_at desc);

alter table partner_kit_tokens enable row level security;

create table if not exists partner_kit_access (
  id uuid primary key default gen_random_uuid(),
  token_id uuid references partner_kit_tokens(id) on delete cascade,
  partner_slug text not null,

  -- What was accessed
  doc_slug text,                       -- null = index page
  event text not null default 'view'   -- 'view' | 'auth' | 'denied'
    check (event in ('view', 'auth', 'denied')),

  -- Request metadata
  ip_hash text,
  user_agent text,
  referrer text,

  accessed_at timestamptz not null default now()
);

create index if not exists partner_kit_access_token_id_idx
  on partner_kit_access (token_id);
create index if not exists partner_kit_access_partner_slug_idx
  on partner_kit_access (partner_slug);
create index if not exists partner_kit_access_accessed_at_idx
  on partner_kit_access (accessed_at desc);

alter table partner_kit_access enable row level security;
