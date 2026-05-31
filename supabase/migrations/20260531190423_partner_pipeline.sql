-- Partner pipeline: the partnerships-role CRM, native to Supabase.
create table if not exists partner_pipeline (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  surface text,                       -- newsletter / podcast / Skool / community
  handle text,                        -- @ or URL (never LinkedIn)
  motion text not null default 'affiliate'
    check (motion in ('affiliate','channel')),
  archetype text,                     -- creator/coach/alumni/community (affiliate)
  audience_est int,
  voice_fit int check (voice_fit between 1 and 5),
  status text not null default 'sourced' check (status in
    ('sourced','enriched','contacted','replied','call_booked',
     'negotiating','activated','passed','cold')),
  contact_path text,                  -- the NON-LinkedIn way in
  why_fit text,
  owner text default 'antaeus',
  next_action text,
  next_action_date date,
  source_agent text,                  -- which agent surfaced them
  notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pp_status_idx on partner_pipeline(status);
create index if not exists pp_motion_idx on partner_pipeline(motion);
create index if not exists pp_next_idx on partner_pipeline(next_action_date);
alter table partner_pipeline enable row level security;
-- service-role only (you reach it via CLI / admin); no anon policy.