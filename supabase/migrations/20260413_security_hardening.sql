-- Migration: Security hardening — RLS on course_progress + fix generated_artifacts policy
-- Addresses audit findings #2 (missing RLS) and #3 (overpermissive RLS)

-- ═══════════════════════════════════════════
-- 1. Enable RLS on course_progress
-- ═══════════════════════════════════════════

ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

-- Users can read their own progress
CREATE POLICY "Users can read own progress"
  ON public.course_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress"
  ON public.course_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress"
  ON public.course_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role has full access (for cron jobs, artifact generation)
CREATE POLICY "Service role full access on progress"
  ON public.course_progress FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ═══════════════════════════════════════════
-- 2. Fix overpermissive RLS on generated_artifacts
--    Replace USING(true) with proper service_role scoping
-- ═══════════════════════════════════════════

DROP POLICY IF EXISTS "Service role can manage artifacts" ON public.generated_artifacts;

CREATE POLICY "Service role can manage artifacts"
  ON public.generated_artifacts FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ═══════════════════════════════════════════
-- 3. Supabase RPC for atomic state_data merge
--    Eliminates the race condition in saveLessonProgress
-- ═══════════════════════════════════════════

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

  -- Atomic upsert
  INSERT INTO public.course_progress (user_id, lesson_id, last_screen, state_data, updated_at)
  VALUES (p_user_id, p_lesson_id, p_last_screen, v_merged, now())
  ON CONFLICT (user_id, lesson_id)
  DO UPDATE SET
    last_screen = EXCLUDED.last_screen,
    state_data = v_merged,
    updated_at = now();
END;
$$;
