-- Task 02.07: State-Saving Mechanics — course_progress table
-- Run this migration in your Supabase SQL Editor (Dashboard → SQL Editor → New query)

create table if not exists public.course_progress (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  lesson_id    text not null,                       -- e.g. "1", "2", "3" … "12"
  is_completed boolean not null default false,
  completed_at timestamptz,
  last_screen  integer not null default 0,          -- last screen index visited
  state_data   jsonb not null default '{}'::jsonb,  -- flexible per-lesson state
  updated_at   timestamptz not null default now(),
  created_at   timestamptz not null default now(),

  constraint course_progress_user_lesson_unique unique (user_id, lesson_id)
);

-- Index for fast lookups by user
create index if not exists idx_course_progress_user
  on public.course_progress (user_id);

-- Auto-update updated_at on every row change
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.course_progress
  for each row
  execute function public.handle_updated_at();

-- Row Level Security: users can only access their own rows
alter table public.course_progress enable row level security;

create policy "Users can view their own progress"
  on public.course_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on public.course_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.course_progress for update
  using (auth.uid() = user_id);
