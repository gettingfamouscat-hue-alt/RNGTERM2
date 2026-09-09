-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastRollAt" DATETIME,
    "totalEP" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Roll" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "rollNumber" INTEGER NOT NULL,
    "totalEP" INTEGER NOT NULL,
    "rarity" TEXT NOT NULL,
    "rollDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utcDate" TEXT NOT NULL,
    CONSTRAINT "Roll_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "epValue" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "RollBadge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rollId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    CONSTRAINT "RollBadge_rollId_fkey" FOREIGN KEY ("rollId") REFERENCES "Roll" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RollBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaintenanceMode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "enabled" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE INDEX "Roll_playerId_idx" ON "Roll"("playerId");

-- CreateIndex
CREATE INDEX "Roll_utcDate_idx" ON "Roll"("utcDate");

-- CreateIndex
CREATE INDEX "Roll_totalEP_idx" ON "Roll"("totalEP");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_code_key" ON "Badge"("code");

-- CreateIndex
CREATE INDEX "RollBadge_rollId_idx" ON "RollBadge"("rollId");

-- CreateIndex
CREATE INDEX "RollBadge_badgeId_idx" ON "RollBadge"("badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "RollBadge_rollId_badgeId_key" ON "RollBadge"("rollId", "badgeId");
