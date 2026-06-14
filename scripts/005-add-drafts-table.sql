-- Create drafts table for saving incomplete job postings
CREATE TABLE IF NOT EXISTS job_drafts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    company VARCHAR(255),
    location VARCHAR(255),
    type VARCHAR(100),
    salary VARCHAR(255),
    description TEXT,
    requirements TEXT[] DEFAULT '{}',
    benefits TEXT[] DEFAULT '{}',
    application_deadline DATE,
    contact_email VARCHAR(255),
    application_link VARCHAR(255),
    application_address VARCHAR(255),
    company_website VARCHAR(255),
    education TEXT[] DEFAULT '{}',
    experience TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    introduction TEXT,
    category VARCHAR(255),
    how_to_apply TEXT,
    career_level VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_job_drafts_created_at ON job_drafts(created_at);
CREATE INDEX IF NOT EXISTS idx_job_drafts_company ON job_drafts(company);
