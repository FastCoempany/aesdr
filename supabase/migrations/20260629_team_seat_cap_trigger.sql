-- Adversarial final pass 2026-06-29 — FIX (MEDIUM, integrity): team seat
-- allocation was count-then-insert in app code (app/api/team/invite/route.ts):
-- two concurrent invites both read memberCount = max_seats-1, both pass the
-- check, and both insert — overflowing max_seats. App-level checks can't be
-- atomic across requests; enforce the cap in the database.
--
-- A BEFORE INSERT trigger takes a transaction-scoped advisory lock keyed on the
-- team, then re-counts under the lock. Concurrent inserts for the same team
-- serialize, so the (count >= max) check is race-free. The lock auto-releases at
-- commit/rollback. Raises with SQLSTATE 23514 (check_violation) and message
-- 'team_seats_full' so the route can map it to a clean 400.
--
-- Also adds a unique (team_id, lower(email)) index so the "already invited"
-- check can't be raced into duplicate member rows either. Apply in the SQL editor.

create or replace function public.enforce_team_seat_cap()
returns trigger
language plpgsql
as $$
declare
  v_max int;
  v_count int;
begin
  -- Serialize concurrent inserts for THIS team within their transactions.
  perform pg_advisory_xact_lock(hashtextextended(new.team_id::text, 0));

  select max_seats into v_max from public.teams where id = new.team_id;
  if v_max is null then
    return new; -- no team row (or no cap configured) → let FKs decide
  end if;

  select count(*) into v_count from public.team_members where team_id = new.team_id;
  if v_count >= v_max then
    raise exception 'team_seats_full' using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_team_seat_cap on public.team_members;
create trigger trg_enforce_team_seat_cap
  before insert on public.team_members
  for each row execute function public.enforce_team_seat_cap();

create unique index if not exists uq_team_members_team_email
  on public.team_members (team_id, lower(email));
