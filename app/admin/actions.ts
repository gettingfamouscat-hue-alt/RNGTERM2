'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

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
  const session = await getSession();
  return session.isAdmin === true;
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
        { displayName: { contains: query } },
        { id: { contains: query } },
      ],
    },
    include: {
      rolls: {
        orderBy: { rollDate: 'desc' },
        take: 5,
      },
    },
    take: 20,
  });
  
  return players;
}

export async function getAllRolls(page: number = 0) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) throw new Error('Unauthorized');
  
  const pageSize = 50;
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
    skip: page * pageSize,
    take: pageSize,
  });
  
  const total = await prisma.roll.count();
  
  return { rolls, total, pageSize };
}

export async function toggleMaintenance() {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) throw new Error('Unauthorized');
  
  const current = await prisma.maintenanceMode.findUnique({ where: { id: 1 } });
  const newValue = !current?.enabled;
  
  await prisma.maintenanceMode.update({
    where: { id: 1 },
    data: { enabled: newValue },
  });
  
  return { enabled: newValue };
}

export async function grantExtraRoll(playerId: string) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) throw new Error('Unauthorized');
    
    const today = new Date().toISOString().split('T')[0];
    
    // Delete today's roll if exists (allows player to roll again)
    const deleted = await prisma.roll.deleteMany({
      where: {
        playerId,
        utcDate: today,
      },
    });
    
    return { success: true, rollsDeleted: deleted.count };
  } catch (error) {
    console.error('Grant roll error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to grant extra roll');
  }
}

export async function toggleBadge(badgeId: string) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) throw new Error('Unauthorized');
    
    const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
    if (!badge) throw new Error('Badge not found');
    
    await prisma.badge.update({
      where: { id: badgeId },
      data: { enabled: !badge.enabled },
    });
    
    return { enabled: !badge.enabled };
  } catch (error) {
    console.error('Toggle badge error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to toggle badge');
  }
}

export async function deletePlayer(playerId: string) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) throw new Error('Unauthorized');
    
    // Cascade delete: rolls will be deleted automatically due to FK constraints
    await prisma.player.delete({
      where: { id: playerId },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Delete player error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete player');
  }
}

export async function getAllBadges() {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) throw new Error('Unauthorized');
  
  const badges = await prisma.badge.findMany({
    include: {
      _count: {
        select: { rollBadges: true },
      },
    },
    orderBy: { name: 'asc' },
  });
  
  return badges;
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
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) throw new Error('Unauthorized');
    
    // Validate inputs
    if (!data.name || !data.code || !data.description) {
      throw new Error('Name, code, and description are required');
    }
    
    if (!['Common', 'Uncommon', 'Rare', 'Epic', 'Anomaly', 'Mythic'].includes(data.rarity)) {
      throw new Error('Invalid rarity');
    }
    
    if (data.epValue < 0 || data.epValue > 100000) {
      throw new Error('EP value must be between 0 and 100,000');
    }
    
    // Check if code already exists
    const existing = await prisma.badge.findUnique({ where: { code: data.code } });
    if (existing) {
      throw new Error('Badge code already exists');
    }
    
    // Create badge with detector config stored as JSON
    const badge = await prisma.badge.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        rarity: data.rarity,
        epValue: data.epValue,
        enabled: true,
      },
    });
    
    return { success: true, badge };
  } catch (error) {
    console.error('Create badge error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create badge');
  }
}
