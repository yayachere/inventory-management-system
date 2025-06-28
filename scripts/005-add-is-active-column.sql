-- 005-add-is-active-column.sql
-- Run this once after deploying the previous code changes.

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL;
