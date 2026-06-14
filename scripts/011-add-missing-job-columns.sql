-- Ensure all columns referenced by the edit dialog exist and have the right types.
-- Safe to run multiple times.

BEGIN;

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS company_logo text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS career_level text,
  ADD COLUMN IF NOT EXISTS how_to_apply text,
  ADD COLUMN IF NOT EXISTS requirements jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS benefits jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS education jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS experience jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS skills jsonb DEFAULT '[]'::jsonb;

-- Optional helpful index for recent lists
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs((created_at));

COMMIT;
