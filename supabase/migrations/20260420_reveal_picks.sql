-- Stores which artifact the user chose on the reveal page
create table if not exists reveal_picks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chosen_artifact text not null check (chosen_artifact in ('playbill', 'redline')),
  picked_at timestamptz not null default now(),
  constraint reveal_picks_user_unique unique (user_id)
);

-- RLS
alter table reveal_picks enable row level security;

create policy "Users can read own pick"
  on reveal_picks for select
  using (auth.uid() = user_id);

create policy "Users can insert own pick"
  on reveal_picks for insert
  with check (auth.uid() = user_id);
