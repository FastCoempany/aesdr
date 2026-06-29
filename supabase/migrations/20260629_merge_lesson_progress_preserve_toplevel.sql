-- Adversarial pass 2026-06-29 — FIX: course completion was impossible.
--
-- merge_lesson_progress rebuilt state_data as `p_state_data || {_units: …}`, so
-- any top-level key in the EXISTING row that wasn't in the single incoming unit's
-- payload was dropped on every /api/progress save. The completion bookkeeping key
-- `_unitsComplete` (written top-level by /api/progress/complete) was therefore
-- wiped between units, so the complete route's `completedUnitCount` never reached
-- the unit total and no multi-unit lesson (all 12 have 3 units) could ever finish.
--
-- Fix: prefix the merge with the existing row so top-level keys carry forward,
-- THEN overlay the incoming payload, THEN rebuild the _units namespace. The
-- complete route also now derives completion from the surviving per-unit flags as
-- a belt-and-suspenders, but this is the root-cause fix. Apply in the SQL editor.

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

  -- Build merged state: EXISTING top-level keys (e.g. _unitsComplete) carry
  -- forward, overlaid by the incoming flat keys, then the rebuilt _units
  -- namespace. The leading COALESCE(v_existing) is the completion fix.
  v_merged := COALESCE(v_existing, '{}'::jsonb) || p_state_data || jsonb_build_object(
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
