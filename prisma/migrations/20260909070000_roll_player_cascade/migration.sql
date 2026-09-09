-- AlterForeignKey: Roll.playerId → Player.id ON DELETE CASCADE
ALTER TABLE "Roll" DROP CONSTRAINT IF EXISTS "Roll_playerId_fkey";

ALTER TABLE "Roll"
ADD CONSTRAINT "Roll_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "Player"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
