-- ============================================================================
-- Pipeline reclassification — discovery doctrine v2.0 motion tags (2026-06-01)
-- Selling your own course/coaching, or affiliating for a competitor, is no
-- longer a hard cut. It is a motion tag that routes the outreach angle.
-- This brings the 17 'passed' competing-course rows back as coach_complement,
-- and tags the rows Dossier reclassified on 2026-06-01.
-- Paste into: https://supabase.com/dashboard/project/jwhjysjvehqslzcfpehl/sql/new
-- Run the SELECT preview first, then the UPDATEs.
-- ============================================================================

-- ── 0. add the angle column (routes outreach approach within the affiliate motion) ──
alter table partner_pipeline add column if not exists angle text;
comment on column partner_pipeline.angle is
  'discovery-doctrine §4.5 outreach approach: clean | coach_complement | open_recruit | co_marketing';

-- ── PREVIEW: current state before reclass ──
select status, count(*) from partner_pipeline group by status order by count(*) desc;

-- ── 1. default every affiliate-motion row to clean, re-tag specifics below ──
update partner_pipeline
set angle = 'clean'
where motion = 'affiliate' and angle is null;

-- ── 2. re-tag the rows Dossier reclassified on 2026-06-01 ──
-- Neil + Nick sell their own coaching → coach_complement
update partner_pipeline
set angle = 'coach_complement',
    next_action = 'Dossier confirmed coach_complement; Scribe coach_complement first-touch',
    updated_at = now()
where name in ('Neil Bhuiyan', 'Nick Bontrager');

-- Tajh affiliates for HigherLevels → open_recruit
update partner_pipeline
set angle = 'open_recruit',
    next_action = 'Dossier confirmed open_recruit; Scribe open_recruit first-touch',
    updated_at = now()
where name = 'Tajh Walker';

-- ── 3. bring the competing-course rows back from 'passed' as coach_complement ──
-- (doctrine v2.0 — course/coaching owners are a complement, not a cut)
update partner_pipeline
set status = 'enriched',
    angle = 'coach_complement',
    next_action = 'Dossier deep-brief to confirm motion, then Scribe coach_complement first-touch',
    next_action_date = current_date + 1,
    updated_at = now()
where status = 'passed' and why_fit ilike '%conflict: hard%';

-- ── 4. Michael Gagliano runs a community + a training-vendor partnership ──
-- the relationship fits co_marketing better than a referral link
update partner_pipeline
set angle = 'co_marketing'
where name = 'Michael Gagliano';

-- ── VERIFY ──
select status, angle, count(*)
from partner_pipeline
group by status, angle
order by status, angle;
-- expect: enriched rows now carry a mix of clean / coach_complement / open_recruit
--         / co_marketing; the 17 formerly-passed are back as enriched coach_complement;
--         Collin Mitchell stays cold.
