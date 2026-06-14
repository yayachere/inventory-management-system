-- Verify and ensure company_logo column exists with proper type
-- Safe to run multiple times

BEGIN;

-- Ensure company_logo column exists
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_logo TEXT;

-- Also ensure it exists in job_drafts table
ALTER TABLE job_drafts ADD COLUMN IF NOT EXISTS company_logo TEXT;

-- Verify the columns exist by selecting from information_schema
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' AND column_name = 'company_logo'
    ) THEN
        RAISE EXCEPTION 'company_logo column does not exist in jobs table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'job_drafts' AND column_name = 'company_logo'
    ) THEN
        RAISE EXCEPTION 'company_logo column does not exist in job_drafts table';
    END IF;
    
    RAISE NOTICE 'company_logo columns verified successfully in both tables';
END $$;

COMMIT;
