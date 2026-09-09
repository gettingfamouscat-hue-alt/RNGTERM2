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
  deletePlayer,
  createBadge,
  adminAutoRoll,
} from '@/app/admin/actions';
import { SAFE_DETECTOR_PRESETS } from '@/lib/badgePresets';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [view, setView] = useState<'dashboard' | 'players' | 'rolls' | 'badges' | 'autoroll'>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [rolls, setRolls] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateBadge, setShowCreateBadge] = useState(false);
  const [newBadge, setNewBadge] = useState({
    name: '',
    code: '',
    description: '',
    rarity: 'Common',
    epValue: 100,
    detectorType: 'exact',
    detectorValue: '',
  });
  const [autoRollPlayer, setAutoRollPlayer] = useState('');
  const [autoRollCount, setAutoRollCount] = useState(10);
  const [autoRollResults, setAutoRollResults] = useState<any[]>([]);
  const [autoRollRunning, setAutoRollRunning] = useState(false);
  const [adminMessage, setAdminMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
      setPlayers(Array.isArray(results) ? results : []);
    } catch (e) {
      console.error(e);
      alert('Search failed. Please try again.');
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadRolls() {
    setLoading(true);
    try {
      const data = await getAllRolls(0);
      setRolls(Array.isArray(data?.rolls) ? data.rolls : []);
    } catch (e) {
      console.error(e);
      alert('Failed to load rolls. Please try again.');
      setRolls([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadBadges() {
    setLoading(true);
    try {
      const data = await getAllBadges();
      setBadges(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      alert('Failed to load badges. Please try again.');
      setBadges([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleMaintenance() {
    try {
      await toggleMaintenance();
      await loadStats();
    } catch (e: any) {
      alert(`❌ Error: ${e?.message || String(e)}`);
    }
  }

  async function handleGrantRoll(playerId: string, playerName: string) {
    if (!confirm(`Remove recent rolls for ${playerName}?\n\nThis will delete their most recent rolls and reduce their EP, giving them a "fresh start".`)) return;
    
    setAdminMessage(null);
    
    try {
      const result = await grantExtraRoll(playerId);
      
      const message = result.rollsDeleted > 0 
        ? `✅ ${playerName}: Removed ${result.rollsDeleted} roll(s), -${result.epRemoved} EP. New total: ${result.newTotalEP} EP (${result.newRollCount} rolls)`
        : `ℹ️ ${playerName} has no rolls to remove`;
      
      setAdminMessage({ type: 'success', text: message });
      alert(message);
      
      // Refresh player data
      if (searchQuery) {
        await handleSearch();
      }
    } catch (e: any) {
      const errorMsg = `❌ Error: ${e?.message || String(e)}`;
      setAdminMessage({ type: 'error', text: errorMsg });
      alert(errorMsg);
    }
  }

  async function handleToggleBadge(badgeId: string, badgeName: string) {
    if (!confirm(`Toggle badge: ${badgeName}?`)) return;
    try {
      await toggleBadge(badgeId);
      await loadBadges();
    } catch (e: any) {
      alert(`❌ Error: ${e.message}`);
    }
  }

  async function handleDeletePlayer(playerId: string, playerName: string) {
    if (!confirm(`⚠️ DELETE PLAYER: ${playerName}?\n\nThis will permanently delete:\n• The player account\n• All their rolls\n• All their badge associations\n\nThis action CANNOT be undone.`)) return;
    
    // Double confirmation for destructive action
    const confirmation = prompt(`Type "${playerName}" to confirm deletion:`);
    if (confirmation !== playerName) {
      setAdminMessage({ type: 'error', text: 'Deletion cancelled - name did not match' });
      return;
    }
    
    setAdminMessage(null);
    
    try {
      await deletePlayer(playerId);
      const successMsg = `✅ Player "${playerName}" has been permanently deleted`;
      setAdminMessage({ type: 'success', text: successMsg });
      alert(successMsg);
      
      // Remove from local state immediately
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      
      // Refresh search results
      if (searchQuery) {
        await handleSearch();
      }
    } catch (e: any) {
      const errorMsg = `❌ Error: ${e?.message || String(e)}`;
      setAdminMessage({ type: 'error', text: errorMsg });
      alert(errorMsg);
    }
  }

  async function handleCreateBadge(e: React.FormEvent) {
    e.preventDefault();
    
    // Validation
    if (!newBadge.name.trim() || !newBadge.code.trim()) {
      alert('Name and Code are required.');
      return;
    }
    
    if (!newBadge.detectorType || !newBadge.detectorValue.trim()) {
      alert('Detector Type and Value are required.');
      return;
    }
    
    try {
      await createBadge({
        name: newBadge.name.trim(),
        code: newBadge.code.trim(),
        description: newBadge.description.trim(),
        rarity: newBadge.rarity,
        epValue: newBadge.epValue,
        detectorType: newBadge.detectorType,
        detectorValue: newBadge.detectorValue.trim(),
      });
      
      alert(`✅ Badge "${newBadge.name}" created successfully!`);
      
      // Reset form
      setNewBadge({
        name: '',
        code: '',
        description: '',
        rarity: 'Common',
        epValue: 100,
        detectorType: 'exact',
        detectorValue: '',
      });
      setShowCreateBadge(false);
      
      // Reload badges
      await loadBadges();
    } catch (e: any) {
      alert(`❌ Error: ${e.message}`);
    }
  }

  async function handleAutoRoll(e: React.FormEvent) {
    e.preventDefault();
    
    if (!autoRollPlayer) {
      alert('Please search and select a player first.');
      return;
    }

    if (autoRollCount < 1 || autoRollCount > 100) {
      alert('Roll count must be between 1 and 100.');
      return;
    }

    if (!confirm(`Run ${autoRollCount} auto-roll(s) for selected player?`)) {
      return;
    }

    setAutoRollRunning(true);
    setAutoRollResults([]);

    try {
      const result = await adminAutoRoll(autoRollPlayer, autoRollCount);
      if (result.success) {
        setAutoRollResults(result.results);
        alert(`✅ Successfully completed ${autoRollCount} roll(s)!`);
      }
    } catch (e: any) {
      alert(`❌ Error: ${e.message}`);
    } finally {
      setAutoRollRunning(false);
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
              {(['dashboard', 'players', 'rolls', 'badges', 'autoroll'] as const).map((tab) => (
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
                  {tab === 'autoroll' ? 'Auto Roll' : tab}
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

              {Array.isArray(players) && players.length > 0 && (
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
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleGrantRoll(player.id, player.displayName)}
                            className="px-4 py-2 border border-yellow-500 text-yellow-400 text-sm rounded-lg hover:bg-yellow-500/10 transition-smooth"
                          >
                            Grant Roll
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePlayer(player.id, player.displayName)}
                            className="px-4 py-2 border border-red-500 text-red-400 text-sm rounded-lg hover:bg-red-500/10 transition-smooth"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-xs text-muted uppercase mb-1">Total EP</div>
                          <div className="text-lg font-bold text-red-400 font-mono">{(player?.totalEP ?? 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted uppercase mb-1">Rolls</div>
                          <div className="text-lg font-bold text-primary">{(player?.rolls ?? []).length}</div>
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-red-400">Badge Management</h2>
                <button
                  onClick={() => setShowCreateBadge(!showCreateBadge)}
                  className="px-6 py-3 border-2 border-lime-400 text-lime-400 font-bold uppercase rounded-lg hover:bg-lime-400 hover:text-void transition-smooth btn-press"
                >
                  {showCreateBadge ? 'Cancel' : '+ Create Badge'}
                </button>
              </div>

              {showCreateBadge && (
                <form onSubmit={handleCreateBadge} className="mb-8 rounded-xl border-2 p-6 glass-panel" style={{ borderColor: 'var(--border-base)' }}>
                  <h3 className="text-lg font-bold text-primary mb-4">Create New Badge</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-muted uppercase mb-2">Badge Name</label>
                      <input
                        type="text"
                        value={newBadge.name}
                        onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border text-primary outline-none transition-smooth focus:border-red-400"
                        style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-base)' }}
                        required
                        placeholder="e.g., Lucky 13"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted uppercase mb-2">Badge Code (unique)</label>
                      <input
                        type="text"
                        value={newBadge.code}
                        onChange={(e) => setNewBadge({ ...newBadge, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                        className="w-full px-4 py-2 rounded-lg border text-primary outline-none transition-smooth focus:border-red-400 font-mono"
                        style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-base)' }}
                        required
                        placeholder="e.g., lucky_13"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-muted uppercase mb-2">Description</label>
                      <input
                        type="text"
                        value={newBadge.description}
                        onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border text-primary outline-none transition-smooth focus:border-red-400"
                        style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-base)' }}
                        required
                        placeholder="e.g., Rolled a multiple of 13"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted uppercase mb-2">Rarity</label>
                      <select
                        value={newBadge.rarity}
                        onChange={(e) => setNewBadge({ ...newBadge, rarity: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border text-primary outline-none transition-smooth focus:border-red-400"
                        style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-base)' }}
                      >
                        <option value="Common">Common</option>
                        <option value="Uncommon">Uncommon</option>
                        <option value="Rare">Rare</option>
                        <option value="Epic">Epic</option>
                        <option value="Anomaly">Anomaly</option>
                        <option value="Mythic">Mythic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-muted uppercase mb-2">EP Value (0-100,000)</label>
                      <input
                        type="number"
                        value={newBadge.epValue}
                        onChange={(e) => setNewBadge({ ...newBadge, epValue: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 rounded-lg border text-primary outline-none transition-smooth focus:border-red-400 font-mono"
                        style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-base)' }}
                        required
                        min="0"
                        max="100000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted uppercase mb-2">Detector Type</label>
                      <select
                        value={newBadge.detectorType}
                        onChange={(e) => setNewBadge({ ...newBadge, detectorType: e.target.value, detectorValue: '' })}
                        className="w-full px-4 py-2 rounded-lg border text-primary outline-none transition-smooth focus:border-red-400"
                        style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-base)' }}
                      >
                        {SAFE_DETECTOR_PRESETS.map(preset => (
                          <option key={preset.type} value={preset.type}>{preset.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-muted uppercase mb-2">
                        Detector Value {SAFE_DETECTOR_PRESETS.find(p => p.type === newBadge.detectorType)?.example && 
                          `(e.g., ${SAFE_DETECTOR_PRESETS.find(p => p.type === newBadge.detectorType)?.example})`}
                      </label>
                      <input
                        type="text"
                        value={newBadge.detectorValue}
                        onChange={(e) => setNewBadge({ ...newBadge, detectorValue: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border text-primary outline-none transition-smooth focus:border-red-400 font-mono"
                        style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-base)' }}
                        placeholder={SAFE_DETECTOR_PRESETS.find(p => p.type === newBadge.detectorType)?.example || 'Optional'}
                        disabled={!['exact', 'divisible', 'contains', 'range', 'ends_with', 'starts_with', 'digit_sum'].includes(newBadge.detectorType)}
                      />
                      <p className="text-xs text-dim mt-1">{SAFE_DETECTOR_PRESETS.find(p => p.type === newBadge.detectorType)?.description}</p>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="mt-4 px-6 py-3 border-2 border-green-400 text-green-400 font-bold uppercase rounded-lg hover:bg-green-400 hover:text-void transition-smooth btn-press"
                  >
                    Create Badge
                  </button>
                </form>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.isArray(badges) && badges.map((badge) => (
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
                      <span className="text-muted uppercase text-xs">{badge?.rarity || 'Unknown'}</span>
                      <span className="text-red-400 font-mono">+{badge?.epValue || 0} EP</span>
                      <span className="text-muted text-xs">{badge?.timesEarned || 0} earned</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auto Roll View */}
          {view === 'autoroll' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-red-400 mb-6">🎲 Auto Roll (Admin Only)</h2>
              
              <div 
                className="rounded-xl border-2 p-6 mb-6 glass-panel"
                style={{ borderColor: 'var(--border-base)' }}
              >
                <form onSubmit={handleAutoRoll} className="space-y-6">
                  {/* Player Selection */}
                  <div>
                    <label className="block text-xs text-muted uppercase mb-2 font-medium">1. Select Player</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or ID..."
                        className="flex-1 px-4 py-2 rounded-lg border text-primary outline-none transition-smooth"
                        style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-base)' }}
                      />
                      <button
                        type="button"
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-4 py-2 border-2 border-cyan-400 text-cyan-400 rounded-lg hover:bg-cyan-400/10 transition-smooth disabled:opacity-50"
                      >
                        Search
                      </button>
                    </div>
                    
                    {Array.isArray(players) && players.length > 0 && (
                      <div className="mt-2 max-h-48 overflow-y-auto space-y-1 p-2 rounded border" style={{ borderColor: 'var(--border-dim)', backgroundColor: 'var(--bg-void)' }}>
                        {players.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setAutoRollPlayer(p.id);
                              setPlayers([]);
                              setSearchQuery(p?.displayName || '');
                            }}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-smooth ${
                              autoRollPlayer === p.id ? 'bg-cyan-400/20 text-cyan-300' : 'hover:bg-cyan-400/10 text-primary'
                            }`}
                          >
                            <span className="font-medium">{p?.displayName || 'Unknown'}</span>
                            <span className="text-muted ml-2">({(p?.totalEP ?? 0).toLocaleString()} EP)</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {autoRollPlayer && (
                      <p className="mt-2 text-xs text-cyan-400">✓ Player selected: {searchQuery}</p>
                    )}
                  </div>

                  {/* Roll Count */}
                  <div>
                    <label className="block text-xs text-muted uppercase mb-2 font-medium">2. Roll Count (1-100)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={autoRollCount}
                      onChange={(e) => setAutoRollCount(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 rounded-lg border text-primary outline-none transition-smooth font-mono"
                      style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-base)' }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={autoRollRunning || !autoRollPlayer}
                      className="px-6 py-3 border-2 border-cyan-400 text-cyan-400 font-bold uppercase rounded-lg hover:bg-cyan-400 hover:text-void transition-smooth btn-press disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {autoRollRunning ? 'Rolling...' : `Run ${autoRollCount} Roll(s)`}
                    </button>
                    {autoRollResults.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setAutoRollResults([])}
                        className="px-6 py-3 border-2 text-muted rounded-lg hover:bg-white/5 transition-smooth"
                        style={{ borderColor: 'var(--border-base)' }}
                      >
                        Clear Results
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Results */}
              {autoRollResults.length > 0 ? (
                <div>
                  <h3 className="text-lg font-bold text-primary mb-4">
                    Results ({autoRollResults.length} roll{autoRollResults.length !== 1 ? 's' : ''})
                  </h3>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {autoRollResults.map((result: any, idx: number) => (
                      <div
                        key={idx}
                        className="rounded-lg border p-4 glass-panel"
                        style={{ borderColor: 'var(--border-base)' }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold font-mono text-primary">
                              {(result?.rollNumber ?? 0).toLocaleString()}
                            </span>
                            <span
                              className="px-3 py-1 rounded text-sm font-bold"
                              style={{
                                backgroundColor: `var(--rarity-${result?.rarity?.toLowerCase() || 'trash'})`,
                                color: 'var(--bg-void)',
                              }}
                            >
                              {result?.rarity || 'Trash'}
                            </span>
                          </div>
                          <span className="text-lg font-bold text-cyan-400">
                            {(result?.totalEP ?? 0).toLocaleString()} EP
                          </span>
                        </div>
                        {Array.isArray(result?.badges) && result.badges.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {result.badges.map((badge: any) => (
                              <span
                                key={badge?.id || Math.random()}
                                className="px-2 py-1 rounded text-xs"
                                style={{
                                  backgroundColor: `var(--rarity-${badge?.rarity?.toLowerCase() || 'common'})20`,
                                  color: `var(--rarity-${badge?.rarity?.toLowerCase() || 'common'})`,
                                }}
                              >
                                {badge?.name || 'Unknown'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : !autoRollPlayer ? (
                <div 
                  className="rounded-xl border p-8 text-center"
                  style={{ borderColor: 'var(--border-dim)', backgroundColor: 'var(--bg-panel)' }}
                >
                  <div className="text-4xl mb-3 opacity-50">🎲</div>
                  <p className="text-muted">Search and select a player to begin auto-rolling</p>
                </div>
              ) : null}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
