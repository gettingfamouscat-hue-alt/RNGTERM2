-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastRollAt" TIMESTAMP(3),
    "totalEP" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roll" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "rollNumber" INTEGER NOT NULL,
    "totalEP" INTEGER NOT NULL,
    "rarity" TEXT NOT NULL,
    "rollDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utcDate" TEXT NOT NULL,

    CONSTRAINT "Roll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "epValue" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RollBadge" (
    "id" TEXT NOT NULL,
    "rollId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,

    CONSTRAINT "RollBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceMode" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MaintenanceMode_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "Roll" ADD CONSTRAINT "Roll_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RollBadge" ADD CONSTRAINT "RollBadge_rollId_fkey" FOREIGN KEY ("rollId") REFERENCES "Roll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RollBadge" ADD CONSTRAINT "RollBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
