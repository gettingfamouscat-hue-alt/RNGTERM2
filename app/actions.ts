'use server';

import { prisma } from '@/lib/prisma';
import { analyzeRoll } from '@/lib/badges';
import { detectBadgesForRoll } from '@/lib/dynamicBadges';
import { randomInt } from 'crypto';
import { cookies } from 'next/headers';

export async function getOrCreatePlayer() {
  try {
    const cookieStore = await cookies();
    let playerId = cookieStore.get('player_id')?.value;
    
    if (!playerId) {
      const player = await prisma.player.create({
        data: {
          displayName: `Player${Math.floor(Math.random() * 10000)}`,
        },
      });
      playerId = player.id;
      (await cookies()).set('player_id', playerId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
      });
    }
    
    return prisma.player.findUnique({ where: { id: playerId } });
  } catch (error) {
    console.error('Get/create player error:', error);
    throw new Error('Failed to get or create player');
  }
}

export async function performRoll() {
  try {
    // Check maintenance mode
    const maintenance = await prisma.maintenanceMode.findUnique({ where: { id: 1 } });
    if (maintenance?.enabled) {
      throw new Error('Maintenance mode is enabled. Please try again later.');
    }
    
    const player = await getOrCreatePlayer();
    if (!player) throw new Error('Player not found');
    
    // Check if player has rolled today (UTC)
    const nowUtc = new Date();
    const utcDate = nowUtc.toISOString().split('T')[0];
    
    const todayRoll = await prisma.roll.findFirst({
      where: {
        playerId: player.id,
        utcDate,
      },
    });
    
    if (todayRoll) {
      throw new Error('You have already rolled today. Come back tomorrow!');
    }
    
    // Generate random number
    const rollNumber = randomInt(0, 1000001); // 0 to 1,000,000 inclusive
    
    // Detect badges using DB-driven detection (supports both static and dynamic badges)
    const dbBadges = await detectBadgesForRoll(rollNumber);
    
    // Calculate total EP and rarity
    const totalEP = dbBadges.reduce((sum, badge) => sum + badge.epValue, 0);
    let rarity = 'Trash';
    if (totalEP >= 8000) rarity = 'Mythic';
    else if (totalEP >= 3000) rarity = 'Anomaly';
    else if (totalEP >= 1500) rarity = 'Epic';
    else if (totalEP >= 500) rarity = 'Rare';
    else if (totalEP >= 150) rarity = 'Uncommon';
    else if (totalEP >= 50) rarity = 'Common';
    
    // Create roll
    const roll = await prisma.roll.create({
      data: {
        playerId: player.id,
        rollNumber,
        totalEP,
        rarity,
        utcDate,
      },
    });
    
    // Create roll badges
    await prisma.rollBadge.createMany({
      data: dbBadges.map(badge => ({
        rollId: roll.id,
        badgeId: badge.id,
      })),
    });
    
    // Update player stats
    await prisma.player.update({
      where: { id: player.id },
      data: {
        lastRollAt: nowUtc,
        totalEP: { increment: totalEP },
      },
    });
    
    // Return serializable data only
    return {
      rollNumber,
      totalEP,
      rarity,
      badges: dbBadges.map(b => ({
        id: b.id,
        name: b.name,
        description: b.description,
        rarity: b.rarity,
        epValue: b.epValue,
      })),
    };
  } catch (error) {
    console.error('Roll error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to perform roll');
  }
}

export async function getPlayerHistory() {
  const player = await getOrCreatePlayer();
  if (!player) return [];
  
  const rolls = await prisma.roll.findMany({
    where: { playerId: player.id },
    include: {
      badges: {
        include: {
          badge: true,
        },
      },
    },
    orderBy: { rollDate: 'desc' },
    take: 20,
  });
  
  return rolls.map(roll => ({
    ...roll,
    badges: roll.badges.map(rb => rb.badge),
  }));
}

export async function getTodayLeaderboard() {
  const nowUtc = new Date();
  const utcDate = nowUtc.toISOString().split('T')[0];
  
  const topRolls = await prisma.roll.findMany({
    where: { utcDate },
    include: {
      player: true,
      badges: {
        include: {
          badge: true,
        },
      },
    },
    orderBy: { totalEP: 'desc' },
    take: 100,
  });
  
  // Filter out guest players (Player + digits) from leaderboard
  return topRolls
    .filter(roll => !/^Player\d+$/.test(roll.player.displayName))
    .map(roll => ({
      displayName: roll.player.displayName,
      rollNumber: roll.rollNumber,
      totalEP: roll.totalEP,
      rarity: roll.rarity,
      badges: roll.badges.map(rb => ({
        name: rb.badge.name,
        rarity: rb.badge.rarity,
      })),
    }));
}

export async function getAllTimeLeaderboard() {
  const topPlayers = await prisma.player.findMany({
    orderBy: { totalEP: 'desc' },
    take: 10,
    include: {
      rolls: {
        orderBy: { rollDate: 'desc' },
        take: 1,
      },
    },
  });
  
  return topPlayers;
}

export async function updateDisplayName(name: string) {
  const player = await getOrCreatePlayer();
  if (!player) throw new Error('Player not found');
  
  if (name.length < 2 || name.length > 20) {
    throw new Error('Name must be 2-20 characters');
  }
  
  await prisma.player.update({
    where: { id: player.id },
    data: { displayName: name },
  });
  
  return { success: true };
}
