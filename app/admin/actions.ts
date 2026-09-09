'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

export async function adminLogin(username: string, password: string) {
  try {
    const correctUsername = process.env.ADMIN_USERNAME;
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctUsername || !correctPassword) {
      return { success: false, error: 'Admin credentials are not configured' };
    }
    
    if (username === correctUsername && password === correctPassword) {
      const session = await getSession();
      session.isAdmin = true;
      await session.save();
      return { success: true };
    }
    
    return { success: false, error: 'Invalid credentials' };
  } catch (error) {
    console.error('Admin login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

export async function adminLogout() {
  try {
    const session = await getSession();
    session.isAdmin = false;
    await session.destroy();
  } catch (error) {
    console.error('Logout error:', error);
  }
  redirect('/admin');
}

export async function checkAdminAuth() {
  try {
    const session = await getSession();
    return session.isAdmin === true;
  } catch (error) {
    console.error('checkAdminAuth error:', error);
    return false;
  }
}

export async function getAdminStats() {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) throw new Error('Unauthorized');
  
  const [
    totalPlayers,
    totalRolls,
    rollsToday,
    maintenanceMode
  ] = await Promise.all([
    prisma.player.count(),
    prisma.roll.count(),
    prisma.roll.count({
      where: {
        utcDate: new Date().toISOString().split('T')[0],
      },
    }),
    prisma.maintenanceMode.findUnique({ where: { id: 1 } }),
  ]);
  
  const topRollsToday = await prisma.roll.findMany({
    where: {
      utcDate: new Date().toISOString().split('T')[0],
    },
    include: {
      player: true,
      badges: {
        include: {
          badge: true,
        },
      },
    },
    orderBy: { totalEP: 'desc' },
    take: 10,
  });
  
  const badgeStats = await prisma.badge.findMany({
    include: {
      _count: {
        select: { rollBadges: true },
      },
    },
    orderBy: {
      rollBadges: {
        _count: 'desc',
      },
    },
    take: 10,
  });
  
  return {
    totalPlayers,
    totalRolls,
    rollsToday,
    maintenanceEnabled: maintenanceMode?.enabled || false,
    topRollsToday,
    badgeStats,
  };
}

export async function searchPlayers(query: string) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) throw new Error('Unauthorized');
  
  const players = await prisma.player.findMany({
    where: {
      OR: [
        { displayName: { contains: query, mode: 'insensitive' } },
        { id: query },
      ],
    },
    orderBy: { totalEP: 'desc' },
    take: 50,
  });
  
  return players;
}

export async function getAllRolls(offset: number = 0) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) throw new Error('Unauthorized');
  
  const rolls = await prisma.roll.findMany({
    include: {
      player: true,
      badges: {
        include: {
          badge: true,
        },
      },
    },
    orderBy: { rollDate: 'desc' },
    skip: offset,
    take: 100,
  });
  
  return { rolls };
}

export async function toggleMaintenance() {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) throw new Error('Unauthorized');
  
  const current = await prisma.maintenanceMode.findUnique({ where: { id: 1 } });
  
  if (!current) {
    await prisma.maintenanceMode.create({
      data: { id: 1, enabled: true },
    });
  } else {
    await prisma.maintenanceMode.update({
      where: { id: 1 },
      data: { enabled: !current.enabled },
    });
  }
  
  return { success: true };
}

export async function grantExtraRoll(playerId: string) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) throw new Error('Unauthorized');
  
  try {
    const utcDate = new Date().toISOString().split('T')[0];
    const result = await prisma.roll.deleteMany({
      where: {
        playerId,
        utcDate,
      },
    });
    
    return { success: true, rollsDeleted: result.count };
  } catch (error) {
    console.error('Grant roll error:', error);
    throw new Error('Failed to grant extra roll');
  }
}

export async function getAllBadges() {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) throw new Error('Unauthorized');
  
  try {
    const badges = await prisma.badge.findMany({
      orderBy: { name: 'asc' },
    });
    
    const badgesWithCount = await Promise.all(
      badges.map(async (badge) => {
        try {
          const count = await prisma.rollBadge.count({
            where: { badgeId: badge.id },
          });
          return {
            ...badge,
            timesEarned: count || 0,
          };
        } catch (error) {
          console.error(`Error counting badges for ${badge.id}:`, error);
          return {
            ...badge,
            timesEarned: 0,
          };
        }
      })
    );
    
    return badgesWithCount;
  } catch (error) {
    console.error('getAllBadges error:', error);
    return [];
  }
}

export async function toggleBadge(badgeId: string) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) throw new Error('Unauthorized');
  
  try {
    const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
    if (!badge) throw new Error('Badge not found');
    
    await prisma.badge.update({
      where: { id: badgeId },
      data: { enabled: !badge.enabled },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Toggle badge error:', error);
    throw new Error('Failed to toggle badge');
  }
}

export async function deletePlayer(playerId: string) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) throw new Error('Unauthorized');
  
  try {
    await prisma.player.delete({
      where: { id: playerId },
    });
    return { success: true };
  } catch (error) {
    console.error('Delete player error:', error);
    throw new Error('Failed to delete player');
  }
}

export async function createBadge(data: {
  name: string;
  code: string;
  description: string;
  rarity: string;
  epValue: number;
  detectorType: string;
  detectorValue: string;
}) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) throw new Error('Unauthorized');

  try {
    await prisma.badge.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        rarity: data.rarity,
        epValue: data.epValue,
        enabled: true,
        detectorType: data.detectorType,
        detectorValue: data.detectorValue,
      },
    });
    return { success: true };
  } catch (error) {
    console.error('Create badge error:', error);
    throw new Error('Failed to create badge');
  }
}

export async function adminAutoRoll(playerId: string, rollCount: number) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) throw new Error('Unauthorized');

  if (rollCount < 1 || rollCount > 100) {
    throw new Error('Roll count must be between 1 and 100');
  }

  try {
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) throw new Error('Player not found');

    const results = [];
    const { detectBadgesForRoll } = await import('@/lib/dynamicBadges');

    for (let i = 0; i < rollCount; i++) {
      const rollNumber = crypto.randomInt(0, 1000001);
      const earnedBadges = await detectBadgesForRoll(rollNumber);
      
      const dbBadges = await prisma.badge.findMany({
        where: {
          code: { in: earnedBadges.map(b => b.code) },
          enabled: true,
        },
      });

      const totalEP = dbBadges.reduce((sum, b) => sum + b.epValue, 0);

      let rarity = 'Trash';
      if (totalEP >= 10000) rarity = 'Mythic';
      else if (totalEP >= 3000) rarity = 'Anomaly';
      else if (totalEP >= 1500) rarity = 'Epic';
      else if (totalEP >= 500) rarity = 'Rare';
      else if (totalEP >= 150) rarity = 'Uncommon';
      else if (totalEP >= 50) rarity = 'Common';

      const nowUtc = new Date();
      const utcDate = nowUtc.toISOString().split('T')[0];

      const roll = await prisma.roll.create({
        data: {
          playerId: player.id,
          rollNumber,
          totalEP,
          rarity,
          utcDate,
        },
      });

      await prisma.rollBadge.createMany({
        data: dbBadges.map(badge => ({
          rollId: roll.id,
          badgeId: badge.id,
        })),
      });

      await prisma.player.update({
        where: { id: player.id },
        data: {
          lastRollAt: nowUtc,
          totalEP: { increment: totalEP },
        },
      });

      results.push({
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
      });
    }

    return { success: true, results };
  } catch (error: any) {
    console.error('Admin auto-roll error:', error);
    throw new Error(error.message || 'Auto-roll failed');
  }
}
