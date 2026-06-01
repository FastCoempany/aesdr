-- ============================================================================
-- Days 8–9 ranking + cut — partner_pipeline (2026-06-01)
-- Demotes 17 hard-conflict (competing-course) rows to 'passed', parks the
-- lowest-scoring survivor to 'cold', stamps next_action_date on the top 25.
-- Composite = voice_fit*3 + audience_bonus + conflict_bonus.
-- Paste into: https://supabase.com/dashboard/project/jwhjysjvehqslzcfpehl/sql/new
-- Run the SELECT first to preview, then the three UPDATEs.
-- ============================================================================

-- ── PREVIEW: the ranking (run this first, eyeball it) ──
select
  name, surface, voice_fit, audience_est,
  (voice_fit*3)
  + (case when audience_est >= 10000 then 2
          when audience_est >= 1000  then 1 else 0 end)
  + (case when why_fit ilike '%conflict: none%' then 2
          when why_fit ilike '%conflict: hard%' then -10
          else 1 end) as composite,
  case when why_fit ilike '%conflict: hard%' then 'HARD'
       when why_fit ilike '%conflict: none%' then 'none'
       else 'soft/other' end as conflict
from partner_pipeline
where status = 'enriched'
order by composite desc, voice_fit desc, name;

-- ── STEP 1: rule out the 17 competing-course conflicts ──
update partner_pipeline
set status = 'passed',
    next_action = 'Ruled out — competing curriculum (Days 8-9 cut)',
    next_action_date = null,
    updated_at = now()
where status = 'enriched'
  and why_fit ilike '%conflict: hard%';
-- expect: UPDATE 17

-- ── STEP 2: park the lowest-scoring survivor (lower fit + unverified 2026 activity) ──
update partner_pipeline
set status = 'cold',
    next_action = 'Parked — lower fit + 2026 activity unverified; revisit in wave 2',
    next_action_date = null,
    updated_at = now()
where name = 'Collin Mitchell' and status = 'enriched';
-- expect: UPDATE 1

-- ── STEP 3: stamp the top 25 for outreach ──
update partner_pipeline
set next_action = 'Dispatch Dossier deep-brief, then Scribe first-touch',
    next_action_date = current_date + 1,
    updated_at = now()
where status = 'enriched';
-- expect: UPDATE 25

-- ── VERIFY ──
select status, count(*) from partner_pipeline group by status order by count(*) desc;
-- expect: enriched 25 | passed 17 | cold 1
