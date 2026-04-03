-- Add unique constraint on (user_id, lesson_id) so upserts work correctly.
-- Without this, every saveLessonProgress / markLessonComplete call inserts
-- a duplicate row instead of updating the existing one.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'course_progress_user_lesson_unique'
  ) THEN
    ALTER TABLE public.course_progress
      ADD CONSTRAINT course_progress_user_lesson_unique
      UNIQUE (user_id, lesson_id);
  END IF;
END;
$$;
