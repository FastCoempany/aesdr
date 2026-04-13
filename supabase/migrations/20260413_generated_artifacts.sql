-- Migration: Create generated_artifacts table for caching course output artifacts
-- Each user gets one row per artifact type, regenerated only when course data changes

CREATE TABLE IF NOT EXISTS public.generated_artifacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artifact_type text NOT NULL CHECK (artifact_type IN ('diagnostic', 'playbook', 'mirror')),
  artifact_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_hash text NOT NULL DEFAULT '',
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT generated_artifacts_user_type_unique UNIQUE (user_id, artifact_type)
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_generated_artifacts_user
  ON public.generated_artifacts(user_id);

-- RLS policies
ALTER TABLE public.generated_artifacts ENABLE ROW LEVEL SECURITY;

-- Users can read their own artifacts
CREATE POLICY "Users can read own artifacts"
  ON public.generated_artifacts FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert/update (generation happens server-side)
CREATE POLICY "Service role can manage artifacts"
  ON public.generated_artifacts FOR ALL
  USING (true)
  WITH CHECK (true);
