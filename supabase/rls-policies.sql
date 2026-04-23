-- ═══════════════════════════════════════════════════════════════════════════
-- AESDR Row Level Security Policies
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Idempotent: safe to run multiple times. Drops and recreates each policy.
-- Resilient: skips any table that doesn't exist yet (emits a NOTICE instead).
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
do $$
begin
  if to_regclass('public.purchases') is null then
    raise notice 'skipping public.purchases (table does not exist)';
  else
    execute 'alter table public.purchases enable row level security';
    execute 'drop policy if exists "own purchases readable" on public.purchases';
    execute $p$
      create policy "own purchases readable"
        on public.purchases
        for select
        to authenticated
        using (user_id = auth.uid() or lower(user_email) = lower(auth.email()))
    $p$;
  end if;
end $$;

-- No insert/update/delete policies → only service role can write.

-- ─── course_progress ──────────────────────────────────────────────────────
do $$
begin
  if to_regclass('public.course_progress') is null then
    raise notice 'skipping public.course_progress (table does not exist)';
  else
    execute 'alter table public.course_progress enable row level security';

    execute 'drop policy if exists "own progress readable" on public.course_progress';
    execute $p$
      create policy "own progress readable"
        on public.course_progress
        for select
        to authenticated
        using (user_id = auth.uid())
    $p$;

    execute 'drop policy if exists "own progress writable" on public.course_progress';
    execute $p$
      create policy "own progress writable"
        on public.course_progress
        for insert
        to authenticated
        with check (user_id = auth.uid())
    $p$;

    execute 'drop policy if exists "own progress updatable" on public.course_progress';
    execute $p$
      create policy "own progress updatable"
        on public.course_progress
        for update
        to authenticated
        using (user_id = auth.uid())
        with check (user_id = auth.uid())
    $p$;
  end if;
end $$;

-- ─── reveal_picks ─────────────────────────────────────────────────────────
do $$
begin
  if to_regclass('public.reveal_picks') is null then
    raise notice 'skipping public.reveal_picks (table does not exist — run 20260420_reveal_picks.sql)';
  else
    execute 'alter table public.reveal_picks enable row level security';

    execute 'drop policy if exists "own reveal readable" on public.reveal_picks';
    execute $p$
      create policy "own reveal readable"
        on public.reveal_picks
        for select
        to authenticated
        using (user_id = auth.uid())
    $p$;

    execute 'drop policy if exists "own reveal insertable" on public.reveal_picks';
    execute $p$
      create policy "own reveal insertable"
        on public.reveal_picks
        for insert
        to authenticated
        with check (user_id = auth.uid())
    $p$;
  end if;
end $$;

-- ─── artifact_unlocks ─────────────────────────────────────────────────────
do $$
begin
  if to_regclass('public.artifact_unlocks') is null then
    raise notice 'skipping public.artifact_unlocks (table does not exist — run 20260420_artifact_unlocks.sql)';
  else
    execute 'alter table public.artifact_unlocks enable row level security';

    execute 'drop policy if exists "own unlocks readable" on public.artifact_unlocks';
    execute $p$
      create policy "own unlocks readable"
        on public.artifact_unlocks
        for select
        to authenticated
        using (user_id = auth.uid())
    $p$;
  end if;
end $$;

-- Only service role can write unlocks (via Stripe webhook).

-- ─── generated_artifacts ──────────────────────────────────────────────────
do $$
begin
  if to_regclass('public.generated_artifacts') is null then
    raise notice 'skipping public.generated_artifacts (table does not exist — run 20260413_generated_artifacts.sql)';
  else
    execute 'alter table public.generated_artifacts enable row level security';

    execute 'drop policy if exists "own artifacts readable" on public.generated_artifacts';
    execute $p$
      create policy "own artifacts readable"
        on public.generated_artifacts
        for select
        to authenticated
        using (user_id = auth.uid())
    $p$;

    execute 'drop policy if exists "own artifacts writable" on public.generated_artifacts';
    execute $p$
      create policy "own artifacts writable"
        on public.generated_artifacts
        for insert
        to authenticated
        with check (user_id = auth.uid())
    $p$;
  end if;
end $$;

-- ─── teams ────────────────────────────────────────────────────────────────
do $$
begin
  if to_regclass('public.teams') is null then
    raise notice 'skipping public.teams (table does not exist — run 20260416_teams.sql)';
  else
    execute 'alter table public.teams enable row level security';

    execute 'drop policy if exists "team visible to owner and members" on public.teams';
    execute $p$
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
        )
    $p$;
  end if;
end $$;

-- ─── team_members ─────────────────────────────────────────────────────────
do $$
begin
  if to_regclass('public.team_members') is null then
    raise notice 'skipping public.team_members (table does not exist — run 20260416_teams.sql)';
  else
    execute 'alter table public.team_members enable row level security';

    execute 'drop policy if exists "team_members visible to owner and members" on public.team_members';
    execute $p$
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
        )
    $p$;
  end if;
end $$;

-- ─── checkout_sessions ────────────────────────────────────────────────────
-- Server-only table: no authenticated read/write policies.
-- The service role can still read/write (RLS is bypassed for service role).
do $$
begin
  if to_regclass('public.checkout_sessions') is null then
    raise notice 'skipping public.checkout_sessions (table does not exist)';
  else
    execute 'alter table public.checkout_sessions enable row level security';
  end if;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Verification: which tables exist and have RLS enabled?
-- ═══════════════════════════════════════════════════════════════════════════
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'purchases', 'course_progress', 'reveal_picks', 'artifact_unlocks',
    'generated_artifacts', 'teams', 'team_members', 'checkout_sessions'
  )
order by tablename;
-- ═══════════════════════════════════════════════════════════════════════════
