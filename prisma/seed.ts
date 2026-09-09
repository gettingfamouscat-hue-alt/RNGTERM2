import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { BADGES } from '../lib/badges';
import * as path from 'path';

const dbPath = path.join(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');
  
  // Seed badges
  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: {
        name: badge.name,
        description: badge.description,
        rarity: badge.rarity,
        epValue: badge.epValue,
      },
      create: {
        code: badge.code,
        name: badge.name,
        description: badge.description,
        rarity: badge.rarity,
        epValue: badge.epValue,
      },
    });
  }
  
  // Ensure maintenance mode record exists
  await prisma.maintenanceMode.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, enabled: false },
  });
  
  console.log(`Seeded ${BADGES.length} badges`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
