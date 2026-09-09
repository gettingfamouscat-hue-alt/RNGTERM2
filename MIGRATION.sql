-- Migration to add detector fields to Badge table
-- Run this on your Neon Postgres database

ALTER TABLE "Badge" 
ADD COLUMN IF NOT EXISTS "detectorType" TEXT,
ADD COLUMN IF NOT EXISTS "detectorValue" TEXT;

-- Note: Existing badges will have NULL detector fields and will use their 
-- hardcoded detectors from lib/badges.ts as fallback.
-- New badges created via admin will use the dynamic detector system.
