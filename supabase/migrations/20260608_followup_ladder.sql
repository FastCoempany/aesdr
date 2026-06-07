-- Follow-up ladder state on partner_pipeline.
-- Additive. Lets the follow-up cron (app/api/cron/followup) advance a contacted
-- candidate through the +4d / +9d ladder and stop on reply.
--
--   first_touch_at  — when the cold first-touch actually went out (set by
--                     courier on send, or by the tower's Mark-sent for manual).
--   ladder_step     — 0 none · 1 follow-up-1 drafted · 2 follow-up-2 drafted.
--   last_ladder_at  — when the most recent ladder step was queued.

alter table partner_pipeline add column if not exists first_touch_at timestamptz;
alter table partner_pipeline add column if not exists ladder_step int not null default 0;
alter table partner_pipeline add column if not exists last_ladder_at timestamptz;

-- The ladder cron's hot query: contacted candidates with a first-touch on record.
create index if not exists pp_ladder_idx
  on partner_pipeline (first_touch_at)
  where status = 'contacted' and first_touch_at is not null;
