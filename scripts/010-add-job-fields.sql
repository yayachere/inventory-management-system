-- Add new fields to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS qualification JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS responsibilities JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS how_to_apply TEXT,
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS career_level VARCHAR(50);

-- Update existing jobs with default values
UPDATE jobs 
SET 
  qualification = COALESCE(qualification, '[]'::jsonb),
  responsibilities = COALESCE(responsibilities, '[]'::jsonb),
  category = COALESCE(category, 'General'),
  career_level = COALESCE(career_level, 'Mid Level')
WHERE qualification IS NULL 
   OR responsibilities IS NULL 
   OR category IS NULL 
   OR career_level IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_career_level ON jobs(career_level);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date);

-- Insert some sample data if jobs table is empty
INSERT INTO jobs (
  title, company, location, type, salary, description, 
  requirements, benefits, application_deadline, contact_email,
  category, career_level, qualification, responsibilities
) 
SELECT 
  'Software Developer',
  'Tech Corp',
  'New York, NY',
  'Full-time',
  '$80,000 - $120,000',
  'We are looking for a skilled software developer to join our team.',
  '["Bachelor''s degree in Computer Science", "3+ years of experience", "Proficiency in JavaScript"]'::jsonb,
  '["Health insurance", "401k matching", "Flexible hours"]'::jsonb,
  (CURRENT_DATE + INTERVAL '30 days')::date,
  'hr@techcorp.com',
  'Technology',
  'Mid Level',
  '["Bachelor''s degree in Computer Science or related field", "Strong problem-solving skills"]'::jsonb,
  '["Develop and maintain web applications", "Collaborate with cross-functional teams", "Write clean, maintainable code"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM jobs LIMIT 1);

INSERT INTO jobs (
  title, company, location, type, salary, description, 
  requirements, benefits, application_deadline, contact_email,
  category, career_level, qualification, responsibilities
) 
SELECT 
  'Marketing Manager',
  'Marketing Plus',
  'Los Angeles, CA',
  'Full-time',
  '$70,000 - $90,000',
  'Join our marketing team to drive brand awareness and customer engagement.',
  '["Bachelor''s degree in Marketing", "5+ years of experience", "Strong communication skills"]'::jsonb,
  '["Health insurance", "Paid vacation", "Professional development"]'::jsonb,
  (CURRENT_DATE + INTERVAL '25 days')::date,
  'careers@marketingplus.com',
  'Marketing',
  'Senior Level',
  '["Bachelor''s degree in Marketing or related field", "Proven track record in digital marketing"]'::jsonb,
  '["Develop marketing strategies", "Manage marketing campaigns", "Analyze market trends"]'::jsonb
WHERE (SELECT COUNT(*) FROM jobs) < 2;

INSERT INTO jobs (
  title, company, location, type, salary, description, 
  requirements, benefits, application_deadline, contact_email,
  category, career_level, qualification, responsibilities
) 
SELECT 
  'Data Analyst',
  'Data Solutions Inc',
  'Chicago, IL',
  'Full-time',
  '$60,000 - $80,000',
  'Analyze data to help drive business decisions and insights.',
  '["Bachelor''s degree in Statistics or related field", "Experience with SQL", "Knowledge of Python or R"]'::jsonb,
  '["Health insurance", "Remote work options", "Learning stipend"]'::jsonb,
  (CURRENT_DATE + INTERVAL '20 days')::date,
  'jobs@datasolutions.com',
  'Data Science',
  'Entry Level',
  '["Strong analytical skills", "Attention to detail", "Bachelor''s degree preferred"]'::jsonb,
  '["Collect and analyze data", "Create reports and dashboards", "Present findings to stakeholders"]'::jsonb
WHERE (SELECT COUNT(*) FROM jobs) < 3;
