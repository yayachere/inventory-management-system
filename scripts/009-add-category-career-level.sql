-- Add category and career_level fields to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS career_level VARCHAR(50);

-- Update existing jobs with default values
UPDATE jobs 
SET 
  category = CASE 
    WHEN LOWER(title) LIKE '%developer%' OR LOWER(title) LIKE '%engineer%' OR LOWER(title) LIKE '%programmer%' THEN 'Technology'
    WHEN LOWER(title) LIKE '%marketing%' OR LOWER(title) LIKE '%sales%' THEN 'Marketing'
    WHEN LOWER(title) LIKE '%finance%' OR LOWER(title) LIKE '%accounting%' THEN 'Finance'
    WHEN LOWER(title) LIKE '%design%' OR LOWER(title) LIKE '%creative%' THEN 'Design'
    WHEN LOWER(title) LIKE '%manager%' OR LOWER(title) LIKE '%director%' THEN 'Management'
    ELSE 'Other'
  END,
  career_level = CASE 
    WHEN LOWER(title) LIKE '%senior%' OR LOWER(title) LIKE '%lead%' OR LOWER(title) LIKE '%manager%' THEN 'Senior'
    WHEN LOWER(title) LIKE '%junior%' OR LOWER(title) LIKE '%entry%' THEN 'Entry Level'
    ELSE 'Mid Level'
  END
WHERE category IS NULL OR career_level IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_career_level ON jobs(career_level);
