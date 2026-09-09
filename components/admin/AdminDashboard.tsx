'use client';

import { useState, useEffect } from 'react';
import {
  getAdminStats,
  searchPlayers,
  getAllRolls,
  toggleMaintenance,
  grantExtraRoll,
  getAllBadges,
  toggleBadge,
} from '@/app/admin/actions';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [view, setView] = useState<'dashboard' | 'players' | 'rolls' | 'badges'>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [rolls, setRolls] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (view === 'badges' && badges.length === 0) {
      loadBadges();
    }
  }, [view]);

  async function loadStats() {
    setLoading(true);
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const results = await searchPlayers(searchQuery);
      setPlayers(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadRolls() {
    setLoading(true);
    try {
      const data = await getAllRolls(0);
      setRolls(data.rolls);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadBadges() {
    setLoading(true);
    try {
      const data = await getAllBadges();
      setBadges(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleMaintenance() {
    try {
      await toggleMaintenance();
      await loadStats();
    } catch (e) {
      alert('Failed to toggle maintenance mode');
    }
  }

  async function handleGrantRoll(playerId: string, playerName: string) {
    if (!confirm(`Grant extra roll to ${playerName}?`)) return;
    try {
      await grantExtraRoll(playerId);
      alert('Extra roll granted!');
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleToggleBadge(badgeId: string, badgeName: string) {
    if (!confirm(`Toggle badge: ${badgeName}?`)) return;
    try {
      await toggleBadge(badgeId);
      await loadBadges();
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="min-h-screen bg-void admin-theme">
      {/* Ambient gradient */}
      <div className="fixed inset-0 bg-gradient-radial from-red-500/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-void/80 border-b" style={{ borderColor: 'var(--border-base)' }}>
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                <span className="text-red-400">#</span>{' '}
                <span className="text-red-400">ADMIN</span>
                <span className="text-red-600 ml-2">PANEL</span>
              </h1>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-panel-hover transition-smooth"
                style={{ borderColor: 'var(--border-base)', color: 'var(--text-muted)' }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="sticky top-16 z-20 backdrop-blur-xl bg-void/60 border-b" style={{ borderColor: 'var(--border-dim)' }}>
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {(['dashboard', 'players', 'rolls', 'badges'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setView(tab);
                    if (tab === 'rolls' && rolls.length === 0) loadRolls();
                  }}
                  className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium uppercase tracking-wider whitespace-nowrap transition-smooth border-b-2 ${
                    view === tab
                      ? 'text-red-400 border-red-400'
                      : 'text-muted border-transparent hover:text-primary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {view === 'dashboard' && stats && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total Players', value: stats.totalPlayers },
                  { label: 'Total Rolls', value: stats.totalRolls },
                  { label: 'Rolls Today', value: stats.rollsToday },
                ].map((stat) => (
                  <div 
                    key={stat.label}
                    className="rounded-xl border p-6"
                    style={{
                      backgroundColor: 'var(--bg-panel)',
                      borderColor: 'var(--border-base)',
                    }}
                  >
                    <div className="text-xs text-red-600 uppercase tracking-wider mb-2 font-medium">
                      {stat.label}
                    </div>
                    <div className="text-4xl font-bold text-red-400 font-mono">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Maintenance Mode */}
              <div 
                className="rounded-xl border-2 p-6"
                style={{
                  backgroundColor: stats.maintenanceEnabled ? 'rgba(251, 191, 36, 0.1)' : 'var(--bg-panel)',
                  borderColor: stats.maintenanceEnabled ? '#fbbf24' : 'var(--border-base)',
                }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold uppercase tracking-wider mb-2" style={{ color: stats.maintenanceEnabled ? '#fbbf24' : '#ef4444' }}>
                      Maintenance Mode
                    </h3>
                    <p className="text-sm" style={{ color: stats.maintenanceEnabled ? 'rgba(251, 191, 36, 0.8)' : 'var(--text-muted)' }}>
                      {stats.maintenanceEnabled ? 'ACTIVE - New rolls are blocked' : 'Inactive - Normal operation'}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleMaintenance}
                    className={`px-6 py-3 border-2 font-bold uppercase tracking-wider rounded-lg transition-smooth btn-press ${
                      stats.maintenanceEnabled
                        ? 'border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-void'
                        : 'border-red-400 text-red-400 hover:bg-red-400 hover:text-void'
                    }`}
                  >
                    {stats.maintenanceEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>

              {/* Top Rolls */}
              {stats.topRollsToday.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-red-400">
                    Top Rolls Today
                  </h2>
                  <div 
                    className="rounded-xl overflow-hidden border"
                    style={{
                      backgroundColor: 'var(--bg-panel)',
                      borderColor: 'var(--border-base)',
                    }}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                            <th className="px-4 py-3 text-left text-xs font-bold text-red-400 uppercase">Player</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-red-400 uppercase">Roll</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-red-400 uppercase">Rarity</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-red-400 uppercase">EP</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-red-400 uppercase">Badges</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.topRollsToday.map((roll: any) => (
                            <tr key={roll.id} className="border-t transition-smooth hover:bg-panel-hover" style={{ borderColor: 'var(--border-dim)' }}>
                              <td className="px-4 py-3 text-primary">{roll.player.displayName}</td>
                              <td className="px-4 py-3 text-right font-mono">{roll.rollNumber.toLocaleString()}</td>
                              <td className="px-4 py-3 text-center font-bold text-muted">{roll.rarity}</td>
                              <td className="px-4 py-3 text-right text-red-400 font-mono">{roll.totalEP.toLocaleString()}</td>
                              <td className="px-4 py-3 text-right text-muted">{roll.badges.length}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {view === 'players' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold text-red-400">Player Search</h2>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by name or ID..."
                  className="flex-1 px-4 py-3 rounded-lg border text-primary outline-none transition-smooth focus:border-red-400"
                  style={{
                    backgroundColor: 'var(--bg-panel)',
                    borderColor: 'var(--border-base)',
                  }}
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-3 border-2 border-red-400 text-red-400 font-bold uppercase rounded-lg hover:bg-red-400 hover:text-void transition-smooth btn-press disabled:opacity-50"
                >
                  Search
                </button>
              </div>

              {players.length > 0 && (
                <div className="space-y-4">
                  {players.map((player) => (
                    <div 
                      key={player.id}
                      className="rounded-xl border p-6"
                      style={{
                        backgroundColor: 'var(--bg-panel)',
                        borderColor: 'var(--border-base)',
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-primary">{player.displayName}</h3>
                          <p className="text-xs text-muted font-mono mt-1">{player.id}</p>
                        </div>
                        <button
                          onClick={() => handleGrantRoll(player.id, player.displayName)}
                          className="px-4 py-2 border border-yellow-500 text-yellow-400 text-sm rounded-lg hover:bg-yellow-500/10 transition-smooth"
                        >
                          Grant Roll
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-xs text-muted uppercase mb-1">Total EP</div>
                          <div className="text-lg font-bold text-red-400 font-mono">{player.totalEP.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted uppercase mb-1">Rolls</div>
                          <div className="text-lg font-bold text-primary">{player.rolls.length}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted uppercase mb-1">Last Roll</div>
                          <div className="text-sm text-primary">
                            {player.lastRollAt ? new Date(player.lastRollAt).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === 'rolls' && (
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-red-400">All Rolls</h2>
              
              <div 
                className="rounded-xl overflow-hidden border"
                style={{
                  backgroundColor: 'var(--bg-panel)',
                  borderColor: 'var(--border-base)',
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                        <th className="px-4 py-3 text-left text-xs font-bold text-red-400 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-red-400 uppercase">Player</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-red-400 uppercase">Roll</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-red-400 uppercase">Rarity</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-red-400 uppercase">EP</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-red-400 uppercase">Badges</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rolls.map((roll) => (
                        <tr key={roll.id} className="border-t transition-smooth hover:bg-panel-hover" style={{ borderColor: 'var(--border-dim)' }}>
                          <td className="px-4 py-3 text-muted text-xs">
                            {new Date(roll.rollDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-primary">{roll.player.displayName}</td>
                          <td className="px-4 py-3 text-right font-mono">{roll.rollNumber.toLocaleString()}</td>
                          <td className="px-4 py-3 text-center font-bold text-muted">{roll.rarity}</td>
                          <td className="px-4 py-3 text-right text-red-400 font-mono">{roll.totalEP.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-muted">{roll.badges.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {view === 'badges' && (
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-red-400">Badge Management</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`rounded-xl border-2 p-4 transition-all ${
                      badge.enabled ? '' : 'opacity-50'
                    }`}
                    style={{
                      backgroundColor: 'var(--bg-panel)',
                      borderColor: badge.enabled ? 'var(--border-base)' : 'var(--border-dim)',
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-primary">{badge.name}</h4>
                        <p className="text-sm text-muted mt-1">{badge.description}</p>
                      </div>
                      <button
                        onClick={() => handleToggleBadge(badge.id, badge.name)}
                        className={`px-3 py-1 text-xs border rounded transition-smooth ${
                          badge.enabled
                            ? 'border-red-500 text-red-400 hover:bg-red-500/10'
                            : 'border-lime-500 text-lime-400 hover:bg-lime-500/10'
                        }`}
                      >
                        {badge.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm border-t pt-2 mt-2" style={{ borderColor: 'var(--border-dim)' }}>
                      <span className="text-muted uppercase text-xs">{badge.rarity}</span>
                      <span className="text-red-400 font-mono">+{badge.epValue} EP</span>
                      <span className="text-muted text-xs">{badge._count.rollBadges} earned</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
