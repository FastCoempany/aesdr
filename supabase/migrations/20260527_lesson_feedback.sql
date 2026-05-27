-- In-product lesson feedback ("stuck / I disagree / didn't land").
-- Replaces the dashboard "Stuck on Lesson X" mailto with structured,
-- per-lesson capture the founder can triage. Enrolled-but-unfinished
-- learners now have an in-product outlet (Discord is alumni-only by design).
--
-- status starts 'new'; founder flips to 'reviewed' or 'dismissed'.
-- Read by /admin/lesson-feedback via the service-role client (RLS-bypassing),
-- so no public/admin read policy is needed here — only the self policies.

create table if not exists lesson_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text,
  lesson_id text not null,            -- "1".."12"
  role text,                          -- 'ae' | 'sdr' at time of submit
  kind text not null
    check (kind in ('stuck', 'disagree', 'didnt_land', 'other')),
  note text check (note is null or char_length(note) <= 2000),
  last_screen int,                    -- where they were, if known

  status text not null default 'new'
    check (status in ('new', 'reviewed', 'dismissed')),
  status_changed_at timestamptz,

  created_at timestamptz not null default now()
);

create index if not exists lesson_feedback_status_idx
  on lesson_feedback (status);

create index if not exists lesson_feedback_lesson_id_idx
  on lesson_feedback (lesson_id);

create index if not exists lesson_feedback_created_at_idx
  on lesson_feedback (created_at desc);

alter table lesson_feedback enable row level security;

-- Users can insert their own feedback, forced to status 'new'.
create policy "lesson_feedback_self_insert"
  on lesson_feedback for insert
  to authenticated
  with check (auth.uid() = user_id and status = 'new');

-- Users can read their own submissions.
create policy "lesson_feedback_self_read"
  on lesson_feedback for select
  to authenticated
  using (auth.uid() = user_id);
