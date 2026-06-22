-- Audit remediation P0-4: course_progress existed only out-of-band (created by
-- hand in the SQL editor) -- no CREATE TABLE in migrations/, so a DB rebuilt purely
-- from migrations/ (staging/DR/new region) had no course_progress and every
-- progress read/write + artifact generation + the merge_lesson_progress RPC failed.
--
-- This is CREATE TABLE IF NOT EXISTS, so on the live DB (table already present) it
-- is a no-op; on a fresh DB it stands the table up so migrations/ alone work.
-- Columns/keys inferred from app usage (app/api/progress, app/actions/progress,
-- merge_lesson_progress). AUDIT: confirm the column set matches the live table
-- before relying on this for a real rebuild; apply in the Supabase SQL editor.

create table if not exists public.course_progress (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  lesson_id     text not null,
  is_completed  boolean not null default false,
  last_screen   integer not null default 0,
  state_data    jsonb not null default '{}'::jsonb,
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint course_progress_user_lesson_unique unique (user_id, lesson_id)
);

create index if not exists idx_course_progress_user on public.course_progress(user_id);

alter table public.course_progress enable row level security;

do $$ begin
  create policy "Users read own progress" on public.course_progress
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users upsert own progress" on public.course_progress
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
