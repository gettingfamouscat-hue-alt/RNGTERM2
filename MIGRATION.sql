-- MIGRATION: Add onDelete Cascade to Roll.player relation
-- Run this SQL against your Neon production database if you have existing data.
-- This migration adds CASCADE behavior when deleting Players (will auto-delete their Rolls and RollBadges).

-- For PostgreSQL/Neon: Drop and recreate the foreign key with CASCADE
-- Note: Your database may have a different constraint name. Check with:
-- SELECT constraint_name FROM information_schema.table_constraints 
-- WHERE table_name = 'Roll' AND constraint_type = 'FOREIGN KEY';

-- Expected constraint name from Prisma: Roll_playerId_fkey
-- If different, replace in the commands below.

-- Step 1: Drop existing foreign key
ALTER TABLE "Roll" DROP CONSTRAINT IF EXISTS "Roll_playerId_fkey";

-- Step 2: Add new foreign key with CASCADE
ALTER TABLE "Roll" 
ADD CONSTRAINT "Roll_playerId_fkey" 
FOREIGN KEY ("playerId") REFERENCES "Player"("id") 
ON DELETE CASCADE;

-- Verify with:
-- SELECT 
--   tc.constraint_name, 
--   rc.update_rule, 
--   rc.delete_rule
-- FROM information_schema.table_constraints tc
-- JOIN information_schema.referential_constraints rc 
--   ON tc.constraint_name = rc.constraint_name
-- WHERE tc.table_name = 'Roll' 
--   AND tc.constraint_type = 'FOREIGN KEY'
--   AND tc.constraint_name LIKE '%playerId%';
-- 
-- Expected result: delete_rule = 'CASCADE'
