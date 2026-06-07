-- Agent master switches — nothing runs until the operator flips it on.
-- Additive. Each partnership cron (sentinel, scribe, courier, usher, almanac,
-- followup) checks this table before doing anything. The gate is FAIL-SAFE:
-- a missing table, a missing row, or enabled=false all mean OFF. So every
-- agent is paused by default and stays paused until you switch it on in the
-- tower's Agent Controls.
--
-- Seeding nothing on purpose — absence = OFF.

create table if not exists agent_switches (
  agent       text primary key,
  enabled     boolean not null default false,
  updated_at  timestamptz not null default now(),
  updated_by  text
);

alter table agent_switches enable row level security;
-- service-role only (the crons + the tower action reach it); no anon policy.
