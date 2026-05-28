-- Workshop registration: extend affiliates table with per-pilot workshop
-- config, and create workshop_registrants table for capturing prospect
-- sign-ups at /[affiliateSlug]/workshop.
--
-- Per D08 (ratified 2026-05-28: title "What good actually looks like in
-- startup SaaS"), D07 (registration-page spec), D12 (SMS opt-in per
-- canon §10.5 — gated by per-pilot sms_enabled flag).
--
-- Architecture decision (ratified 2026-05-28): workshop config lives on
-- the affiliates table (Supabase, extending existing record) rather than
-- in repo JSON or a separate workshops table. Cadence: one workshop at a
-- time per affiliate (MVP) — re-architect to a workshops table if any
-- affiliate ever runs concurrent workshops.

-- ─── 1. Extend affiliates table with workshop-pilot fields ───
-- All nullable + defaulted so existing rows stay valid. A workshop is
-- "live" only when workshop_registration_open = true AND the slot fields
-- are populated; the page renderer 404s otherwise.

alter table affiliates
  -- Workshop content slots (used by content/affiliate-kit/workshop-registration.md
  -- at render time; not buyer copy themselves, just per-affiliate values).
  add column if not exists workshop_title text,
  add column if not exists workshop_audience_descriptor text,
  add column if not exists workshop_partner_quote text,
  add column if not exists workshop_partner_quote_attribution text,
  add column if not exists workshop_date_iso timestamptz,
  add column if not exists workshop_timezone text default 'America/New_York',

  -- Host info (per D29 placeholders). Falls back to "Admissions" alias
  -- display name (canon §12.3, ratified 2026-05-28 in D17) when null.
  add column if not exists host_first_name text,
  add column if not exists host_last_name text,
  add column if not exists host_tenure_years int,
  add column if not exists host_background_beat text,

  -- Per-pilot SMS toggle (per D12 line 105 — dormant unless pilot wants it).
  -- When false, registration form omits SMS opt-in entirely.
  add column if not exists sms_enabled boolean not null default false,

  -- Master switch — page renders only when this is true AND workshop
  -- slot fields are populated. Lets affiliate be ACTIVE for commissions
  -- (status='active') without their workshop page being live.
  add column if not exists workshop_registration_open boolean not null default false;

-- ─── 2. workshop_registrants table ───
-- One row per prospect who submitted the workshop registration form.
-- Email is unique per (affiliate_slug, workshop_date_iso) so re-submits
-- don't duplicate. RLS: inserts ONLY via service-role from the API
-- route (anon client cannot bypass the validation/rate-limit layer).

create table if not exists workshop_registrants (
  id uuid primary key default gen_random_uuid(),

  -- The affiliate whose workshop this registration is for.
  affiliate_slug text not null references affiliates(slug) on delete cascade,

  -- Denormalised at insert time so historical accuracy survives if the
  -- affiliate later updates their workshop_date_iso for a new pilot.
  workshop_date_iso timestamptz not null,

  -- Registrant identity.
  email text not null,
  first_name text not null,

  -- AE / SDR (the two roles the curriculum is built for).
  role text not null check (role in ('AE', 'SDR')),

  -- Tenure-in-role (D15 references it; optional capture).
  tenure_months int,

  -- SMS opt-in (canon §10.5 — separate, unchecked-by-default consent).
  -- phone_e164 only required when sms_opted_in = true.
  sms_opted_in boolean not null default false,
  phone_e164 text,

  -- Attribution (captured server-side from URL params at form post).
  utm_source text,
  utm_medium text,
  utm_campaign text,

  -- Compliance / dedupe.
  ip_hash text,
  user_agent text,

  -- Audit trail.
  created_at timestamptz not null default now(),

  -- Re-submits to the same workshop with the same email don't duplicate.
  unique (affiliate_slug, workshop_date_iso, email)
);

create index if not exists workshop_registrants_affiliate_slug_idx
  on workshop_registrants (affiliate_slug);
create index if not exists workshop_registrants_workshop_date_idx
  on workshop_registrants (workshop_date_iso);
create index if not exists workshop_registrants_created_at_idx
  on workshop_registrants (created_at desc);

-- ─── 3. RLS: locked down by default ───
-- All access goes through the API route using the service-role client.
-- Anon role gets no policies (denied by RLS). Admin SELECT happens via
-- the service-role client too (in /admin/workshops).

alter table workshop_registrants enable row level security;

-- (Intentionally no policies — service-role client bypasses RLS and is
-- the only path that touches this table.)

-- ─── 4. Seed: optional test/pilot affiliate ───
-- Uncomment and run manually to seed a _PILOT_0 affiliate row for dev
-- testing of the workshop registration page before a real affiliate signs.
--
-- insert into affiliates (
--   slug, display_name, email,
--   status, archetype, sophistication_tier,
--   workshop_title, workshop_audience_descriptor, workshop_date_iso,
--   workshop_registration_open
-- ) values (
--   '_pilot_0', 'Pilot Zero (Test)', 'test@aesdr.com',
--   'active', 'creator', 'developing',
--   'What good actually looks like in startup SaaS',
--   'first-1-to-2-year SDRs and AEs in startup SaaS',
--   '2026-06-15 18:00:00-04', -- ET
--   true
-- );
