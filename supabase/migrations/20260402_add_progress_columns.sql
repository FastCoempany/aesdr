-- Add missing columns to course_progress table
-- Your existing table has: id, user_id, lesson_id, is_completed, completed_at
-- This adds: last_screen, state_data, updated_at, created_at

ALTER TABLE public.course_progress
  ADD COLUMN IF NOT EXISTS last_screen integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS state_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at'
  ) THEN
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON public.course_progress
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END;
$$;
