-- Partner-hub application form submissions.
-- Posted from app/api/partners/apply/route.ts.
-- Public table; no RLS required since inserts come from server-only route
-- using service-role key (no anon-key inserts).

create table if not exists partner_applications (
  id uuid primary key default gen_random_uuid(),

  -- Form fields
  applicant_name text not null,
  audience_descriptor text not null,
  primary_channel text not null check (
    primary_channel in ('newsletter', 'podcast', 'community', 'course', 'other')
  ),
  audience_size text not null,
  link_url text,

  -- Attribution + meta
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  user_agent text,
  ip_hash text,

  -- Lifecycle
  status text not null default 'received' check (
    status in ('received', 'reviewing', 'declined', 'invited', 'passed-vetting')
  ),
  founder_notes text,

  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- Index for sorting recent applications in admin views
create index if not exists partner_applications_submitted_at_idx
  on partner_applications (submitted_at desc);

create index if not exists partner_applications_status_idx
  on partner_applications (status);

-- Lock down: no public access. Server-only inserts via service role.
alter table partner_applications enable row level security;

-- No policies = no access via anon or auth client. Only service role bypasses RLS.
