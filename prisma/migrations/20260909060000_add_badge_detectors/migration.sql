-- AlterTable
ALTER TABLE "Badge"
ADD COLUMN IF NOT EXISTS "detectorType" TEXT,
ADD COLUMN IF NOT EXISTS "detectorValue" TEXT;
