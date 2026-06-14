-- Add company_logo field to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_logo TEXT;

-- Add index for better performance if needed
CREATE INDEX IF NOT EXISTS idx_jobs_company_logo ON jobs(company_logo) WHERE company_logo IS NOT NULL;
