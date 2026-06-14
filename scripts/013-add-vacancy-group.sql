-- Add vacancy_group_id to link multiple positions in one vacancy announcement
BEGIN;

-- Add vacancy_group_id column
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS vacancy_group_id VARCHAR(100);

-- Add is_primary_position to mark the first position in a group (for listing display)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS is_primary_position BOOLEAN DEFAULT true;

-- Create index for better performance when querying grouped positions
CREATE INDEX IF NOT EXISTS idx_jobs_vacancy_group_id ON jobs(vacancy_group_id);

-- For existing jobs, set each as its own group with itself as primary
UPDATE jobs 
SET 
  vacancy_group_id = CONCAT('vacancy_', id::text),
  is_primary_position = true
WHERE vacancy_group_id IS NULL;

COMMIT;
