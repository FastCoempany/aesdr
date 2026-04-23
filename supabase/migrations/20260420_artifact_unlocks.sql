-- Tracks $40 purchases to unlock the second artifact
create table if not exists artifact_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  artifact_type text not null check (artifact_type in ('playbill', 'redline')),
  stripe_session_id text unique not null,
  amount_cents integer not null default 4000,
  unlocked_at timestamptz not null default now(),
  constraint artifact_unlocks_user_type unique (user_id, artifact_type)
);

alter table artifact_unlocks enable row level security;

create policy "Users can read own unlocks"
  on artifact_unlocks for select
  using (auth.uid() = user_id);
