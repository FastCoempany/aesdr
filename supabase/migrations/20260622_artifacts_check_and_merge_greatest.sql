-- Migration (2026-06-22): two correctness fixes surfaced by the workflow audit.
--
-- AUDIT: run in Supabase (migrations are applied by hand in the SQL editor
-- today — see docs/2026-06-17-workflow-audit-and-remediation-plan.md §D).
--
-- ─────────────────────────────────────────────────────────────────────────
-- 1. P0-6 — generated_artifacts CHECK constraint rejects the real types.
--    The artifacts were renamed Playbook→Playbill, Mirror→Redline, but the
--    CHECK from 20260413_generated_artifacts.sql still only allows
--    ('diagnostic','playbook','mirror'). Inserting a 'playbill' / 'redline'
--    row violates the constraint, so generation 500s even after P0-5 wires
--    the trigger.
--
--    NOTE: verify the live column first. Like course_progress (P0-4) this
--    table may have been altered out-of-band, in which case prod already
--    accepts the new types and only migrations/ is stale. This migration is
--    written idempotently (drop-if-exists) so it is safe to re-apply.
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE public.generated_artifacts
  DROP CONSTRAINT IF EXISTS generated_artifacts_artifact_type_check;

ALTER TABLE public.generated_artifacts
  ADD CONSTRAINT generated_artifacts_artifact_type_check
  CHECK (artifact_type IN ('diagnostic', 'playbill', 'redline'));

-- ─────────────────────────────────────────────────────────────────────────
-- 2. C6 / R3-CURR-6 / R4-PERF-8 — merge_lesson_progress clobbers last_screen.
--    The function (20260413_security_hardening.sql:88) sets
--    last_screen = EXCLUDED.last_screen, so an out-of-order save (a slow
--    network flush from an earlier screen landing after a later one, or a
--    second tab one screen behind) moves the saved bookmark *backward*.
--    Guard it with GREATEST so the bookmark is monotonic.
--
--    Everything else in the function is unchanged from the hardening
--    migration; we re-declare it in full (CREATE OR REPLACE) so the live
--    definition matches migrations/.
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.merge_lesson_progress(
  p_user_id uuid,
  p_lesson_id text,
  p_last_screen int,
  p_state_data jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_unit text;
  v_existing jsonb;
  v_prev_units jsonb;
  v_merged jsonb;
BEGIN
  -- Extract unit from incoming data (default "1")
  v_unit := COALESCE(p_state_data->>'unit', '1');

  -- Lock the row for update (or prepare for insert)
  SELECT state_data INTO v_existing
    FROM public.course_progress
    WHERE user_id = p_user_id AND lesson_id = p_lesson_id
    FOR UPDATE;

  IF v_existing IS NULL THEN
    v_prev_units := '{}'::jsonb;
  ELSE
    v_prev_units := COALESCE(v_existing->'_units', '{}'::jsonb);
  END IF;

  -- Build merged state: top-level flat keys + _units namespace
  v_merged := p_state_data || jsonb_build_object(
    '_units', v_prev_units || jsonb_build_object(v_unit, p_state_data)
  );

  -- Atomic upsert. last_screen uses GREATEST so a late out-of-order save
  -- can never rewind the bookmark.
  INSERT INTO public.course_progress (user_id, lesson_id, last_screen, state_data, updated_at)
  VALUES (p_user_id, p_lesson_id, p_last_screen, v_merged, now())
  ON CONFLICT (user_id, lesson_id)
  DO UPDATE SET
    last_screen = GREATEST(public.course_progress.last_screen, EXCLUDED.last_screen),
    state_data = v_merged,
    updated_at = now();
END;
$$;
