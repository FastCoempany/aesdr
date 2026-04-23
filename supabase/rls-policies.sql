-- ═══════════════════════════════════════════════════════════════════════════
-- AESDR Row Level Security Policies
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Idempotent: safe to run multiple times. Drops and recreates each policy.
--
-- What this does:
--   - Enables RLS on every user-data table.
--   - Lets authenticated users read ONLY their own rows.
--   - Lets the service role (server code using SUPABASE_SERVICE_ROLE_KEY)
--     continue to bypass RLS — which is how /api routes and cron jobs work.
--   - Blocks the anon key from reading any row it has no business seeing.
--
-- After running, every page using `@/utils/supabase/server` will still work
-- (authenticated requests use the user's JWT and pass the policy checks).
-- Admin routes using `createAdminClient()` are unaffected.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── purchases ────────────────────────────────────────────────────────────
alter table public.purchases enable row level security;

drop policy if exists "own purchases readable" on public.purchases;
create policy "own purchases readable"
  on public.purchases
  for select
  to authenticated
  using (user_id = auth.uid() or lower(user_email) = lower(auth.email()));

-- No insert/update/delete policies → only service role can write.

-- ─── course_progress ──────────────────────────────────────────────────────
alter table public.course_progress enable row level security;

drop policy if exists "own progress readable" on public.course_progress;
create policy "own progress readable"
  on public.course_progress
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "own progress writable" on public.course_progress;
create policy "own progress writable"
  on public.course_progress
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "own progress updatable" on public.course_progress;
create policy "own progress updatable"
  on public.course_progress
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ─── reveal_picks ─────────────────────────────────────────────────────────
alter table public.reveal_picks enable row level security;

drop policy if exists "own reveal readable" on public.reveal_picks;
create policy "own reveal readable"
  on public.reveal_picks
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "own reveal insertable" on public.reveal_picks;
create policy "own reveal insertable"
  on public.reveal_picks
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- ─── artifact_unlocks ─────────────────────────────────────────────────────
alter table public.artifact_unlocks enable row level security;

drop policy if exists "own unlocks readable" on public.artifact_unlocks;
create policy "own unlocks readable"
  on public.artifact_unlocks
  for select
  to authenticated
  using (user_id = auth.uid());

-- Only service role can write unlocks (via Stripe webhook).

-- ─── playbill_artifacts ───────────────────────────────────────────────────
alter table public.playbill_artifacts enable row level security;

drop policy if exists "own artifacts readable" on public.playbill_artifacts;
create policy "own artifacts readable"
  on public.playbill_artifacts
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "own artifacts writable" on public.playbill_artifacts;
create policy "own artifacts writable"
  on public.playbill_artifacts
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- ─── teams ────────────────────────────────────────────────────────────────
alter table public.teams enable row level security;

-- Owner can read their team; members can also read the team they belong to.
drop policy if exists "team visible to owner and members" on public.teams;
create policy "team visible to owner and members"
  on public.teams
  for select
  to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.team_members tm
      where tm.team_id = public.teams.id
        and tm.user_id = auth.uid()
        and tm.accepted_at is not null
    )
  );

-- ─── team_members ─────────────────────────────────────────────────────────
alter table public.team_members enable row level security;

-- Members can read rows for teams they belong to OR own.
drop policy if exists "team_members visible to owner and members" on public.team_members;
create policy "team_members visible to owner and members"
  on public.team_members
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.teams t
      where t.id = public.team_members.team_id
        and t.owner_id = auth.uid()
    )
  );

-- ─── checkout_sessions ────────────────────────────────────────────────────
-- Server-only table: no authenticated read/write policies.
-- The service role can still read/write (RLS is bypassed for service role).
alter table public.checkout_sessions enable row level security;

-- ═══════════════════════════════════════════════════════════════════════════
-- Verification query — run this after to confirm RLS is on every table:
-- ═══════════════════════════════════════════════════════════════════════════
-- select tablename, rowsecurity
-- from pg_tables
-- where schemaname = 'public'
-- order by tablename;
-- ═══════════════════════════════════════════════════════════════════════════
