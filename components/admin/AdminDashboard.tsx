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
    if (view === 'badges') {
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
    <div className="min-h-screen bg-black text-red-400 font-mono">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-red-500/30 bg-black/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-red-400 tracking-wider flex items-center gap-2">
              <span className="text-yellow-400">#</span> ADMIN PANEL
            </h1>
            <button
              onClick={onLogout}
              className="px-4 py-2 border border-red-500/50 rounded hover:bg-red-500/10 transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Navigation */}
        <nav className="border-b border-red-500/20 bg-black/60 backdrop-blur-sm sticky top-[57px] z-20">
          <div className="container mx-auto px-4">
            <div className="flex gap-1">
              {(['dashboard', 'players', 'rolls', 'badges'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setView(tab);
                    if (tab === 'rolls' && rolls.length === 0) loadRolls();
                  }}
                  className={`px-6 py-3 text-sm uppercase tracking-wider transition-colors border-b-2 ${
                    view === tab
                      ? 'border-red-400 text-red-400 bg-red-500/10'
                      : 'border-transparent text-red-600 hover:text-red-400 hover:bg-red-500/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="container mx-auto px-4 py-8">
          {view === 'dashboard' && stats && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border-2 border-red-500/30 bg-black/40 rounded-lg p-6">
                  <h3 className="text-sm text-red-600 uppercase tracking-wider mb-2">Total Players</h3>
                  <div className="text-4xl font-bold text-red-400">{stats.totalPlayers}</div>
                </div>
                <div className="border-2 border-red-500/30 bg-black/40 rounded-lg p-6">
                  <h3 className="text-sm text-red-600 uppercase tracking-wider mb-2">Total Rolls</h3>
                  <div className="text-4xl font-bold text-red-400">{stats.totalRolls}</div>
                </div>
                <div className="border-2 border-red-500/30 bg-black/40 rounded-lg p-6">
                  <h3 className="text-sm text-red-600 uppercase tracking-wider mb-2">Rolls Today</h3>
                  <div className="text-4xl font-bold text-red-400">{stats.rollsToday}</div>
                </div>
              </div>

              {/* Maintenance Mode */}
              <div className="border-2 border-yellow-500/50 bg-yellow-500/10 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-wider mb-2">
                      Maintenance Mode
                    </h3>
                    <p className="text-yellow-600 text-sm">
                      {stats.maintenanceEnabled ? 'ACTIVE - New rolls are blocked' : 'Inactive - Normal operation'}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleMaintenance}
                    className={`px-6 py-3 border-2 font-bold uppercase tracking-wider rounded transition-colors ${
                      stats.maintenanceEnabled
                        ? 'border-green-400 text-green-400 hover:bg-green-400 hover:text-black'
                        : 'border-red-400 text-red-400 hover:bg-red-400 hover:text-black'
                    }`}
                  >
                    {stats.maintenanceEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>

              {/* Top Rolls Today */}
              <div>
                <h2 className="text-2xl font-bold text-red-400 mb-4 uppercase tracking-wider">
                  Top Rolls Today
                </h2>
                <div className="border-2 border-red-500/30 bg-black/40 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-red-500/30 bg-red-500/10">
                          <th className="px-4 py-3 text-left text-sm font-bold text-red-400 uppercase">Player</th>
                          <th className="px-4 py-3 text-right text-sm font-bold text-red-400 uppercase">Roll</th>
                          <th className="px-4 py-3 text-center text-sm font-bold text-red-400 uppercase">Rarity</th>
                          <th className="px-4 py-3 text-right text-sm font-bold text-red-400 uppercase">EP</th>
                          <th className="px-4 py-3 text-right text-sm font-bold text-red-400 uppercase">Badges</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.topRollsToday.map((roll: any) => (
                          <tr key={roll.id} className="border-b border-red-500/10 hover:bg-red-500/5">
                            <td className="px-4 py-3 text-red-400">{roll.player.displayName}</td>
                            <td className="px-4 py-3 text-right font-mono text-white">{roll.rollNumber.toLocaleString()}</td>
                            <td className="px-4 py-3 text-center font-bold text-red-300">{roll.rarity}</td>
                            <td className="px-4 py-3 text-right text-red-400">{roll.totalEP.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-red-600">{roll.badges.length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Badge Stats */}
              <div>
                <h2 className="text-2xl font-bold text-red-400 mb-4 uppercase tracking-wider">
                  Most Earned Badges
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.badgeStats.map((badge: any) => (
                    <div key={badge.id} className="border border-red-500/30 bg-black/40 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-red-400">{badge.name}</h4>
                          <p className="text-sm text-red-600 mt-1">{badge.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-300">{badge._count.rollBadges}</div>
                          <div className="text-xs text-red-600 uppercase">Earned</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === 'players' && (
            <div>
              <h2 className="text-3xl font-bold text-red-400 mb-6 uppercase tracking-wider">
                Player Search
              </h2>
              
              <div className="mb-6 flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by name or ID..."
                  className="flex-1 px-4 py-3 bg-black border-2 border-red-500/50 rounded text-red-400 focus:border-red-400 outline-none"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-3 border-2 border-red-400 text-red-400 font-bold uppercase rounded hover:bg-red-400 hover:text-black transition-colors"
                >
                  Search
                </button>
              </div>

              {players.length > 0 && (
                <div className="space-y-4">
                  {players.map((player) => (
                    <div key={player.id} className="border-2 border-red-500/30 bg-black/40 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-red-400">{player.displayName}</h3>
                          <p className="text-sm text-red-600 font-mono mt-1">{player.id}</p>
                        </div>
                        <button
                          onClick={() => handleGrantRoll(player.id, player.displayName)}
                          className="px-4 py-2 border border-yellow-500 text-yellow-400 text-sm rounded hover:bg-yellow-500/10 transition-colors"
                        >
                          Grant Extra Roll
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-red-600 uppercase">Total EP</div>
                          <div className="text-lg font-bold text-red-400">{player.totalEP.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-red-600 uppercase">Total Rolls</div>
                          <div className="text-lg font-bold text-red-400">{player.rolls.length}</div>
                        </div>
                        <div>
                          <div className="text-xs text-red-600 uppercase">Last Roll</div>
                          <div className="text-sm text-red-400">
                            {player.lastRollAt ? new Date(player.lastRollAt).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      </div>

                      {player.rolls.length > 0 && (
                        <div className="border-t border-red-500/20 pt-4">
                          <h4 className="text-sm text-red-600 uppercase mb-2">Recent Rolls</h4>
                          <div className="space-y-1">
                            {player.rolls.slice(0, 3).map((roll: any) => (
                              <div key={roll.id} className="text-sm text-red-400 flex justify-between">
                                <span className="font-mono">{roll.rollNumber.toLocaleString()}</span>
                                <span>{roll.rarity} ({roll.totalEP} EP)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === 'rolls' && (
            <div>
              <h2 className="text-3xl font-bold text-red-400 mb-6 uppercase tracking-wider">
                All Rolls
              </h2>
              
              <div className="border-2 border-red-500/30 bg-black/40 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-red-500/30 bg-red-500/10">
                        <th className="px-4 py-3 text-left text-sm font-bold text-red-400 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-red-400 uppercase">Player</th>
                        <th className="px-4 py-3 text-right text-sm font-bold text-red-400 uppercase">Roll</th>
                        <th className="px-4 py-3 text-center text-sm font-bold text-red-400 uppercase">Rarity</th>
                        <th className="px-4 py-3 text-right text-sm font-bold text-red-400 uppercase">EP</th>
                        <th className="px-4 py-3 text-right text-sm font-bold text-red-400 uppercase">Badges</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rolls.map((roll) => (
                        <tr key={roll.id} className="border-b border-red-500/10 hover:bg-red-500/5">
                          <td className="px-4 py-3 text-red-600 text-sm">
                            {new Date(roll.rollDate).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-red-400">{roll.player.displayName}</td>
                          <td className="px-4 py-3 text-right font-mono text-white">{roll.rollNumber.toLocaleString()}</td>
                          <td className="px-4 py-3 text-center font-bold text-red-300">{roll.rarity}</td>
                          <td className="px-4 py-3 text-right text-red-400">{roll.totalEP.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-red-600">{roll.badges.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {view === 'badges' && (
            <div>
              <h2 className="text-3xl font-bold text-red-400 mb-6 uppercase tracking-wider">
                Badge Management
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      badge.enabled
                        ? 'border-red-500/30 bg-black/40'
                        : 'border-gray-700 bg-gray-900/20 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-red-400">{badge.name}</h4>
                        <p className="text-sm text-red-600 mt-1">{badge.description}</p>
                      </div>
                      <button
                        onClick={() => handleToggleBadge(badge.id, badge.name)}
                        className={`px-3 py-1 text-xs border rounded transition-colors ${
                          badge.enabled
                            ? 'border-red-500 text-red-400 hover:bg-red-500/10'
                            : 'border-green-500 text-green-400 hover:bg-green-500/10'
                        }`}
                      >
                        {badge.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm border-t border-red-500/20 pt-2 mt-2">
                      <span className="text-red-600 uppercase">{badge.rarity}</span>
                      <span className="text-red-400 font-mono">+{badge.epValue} EP</span>
                      <span className="text-red-600">{badge._count.rollBadges} earned</span>
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
