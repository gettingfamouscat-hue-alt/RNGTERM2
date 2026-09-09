'use client';

import { useState, useEffect } from 'react';
import { performRoll, getPlayerHistory, getTodayLeaderboard, getOrCreatePlayer, updateDisplayName } from './actions';
import { RollAnimation } from '@/components/RollAnimation';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { Leaderboard } from '@/components/Leaderboard';
import { History } from '@/components/History';
import { ProfilePanel } from '@/components/ProfilePanel';

export default function Home() {
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [player, setPlayer] = useState<any>(null);
  const [view, setView] = useState<'game' | 'history' | 'leaderboard'>('game');
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [playerData, historyData, leaderboardData] = await Promise.all([
        getOrCreatePlayer(),
        getPlayerHistory(),
        getTodayLeaderboard(),
      ]);
      setPlayer(playerData);
      setHistory(historyData);
      setLeaderboard(leaderboardData);
    } catch (e: any) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoll() {
    try {
      setError(null);
      setRolling(true);
      const rollResult = await performRoll();
      setResult(rollResult);
      setTimeout(() => loadData(), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRolling(false);
    }
  }

  async function handleNameChange(name: string) {
    try {
      await updateDisplayName(name);
      await loadData();
      setShowProfile(false);
    } catch (e: any) {
      alert(e.message);
    }
  }

  const hasRolledToday = history.length > 0 && 
    history[0].utcDate === new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-void text-primary">
      {/* Ambient gradient */}
      <div className="fixed inset-0 bg-gradient-radial from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-void/80 border-b" style={{ borderColor: 'var(--border-base)' }}>
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                <span className="text-cyan-400">&gt;</span>{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent">
                  RNGTERM
                </span>
              </h1>
              {player && (
                <button
                  onClick={() => setShowProfile(true)}
                  className="px-3 sm:px-4 py-2 text-sm rounded-lg transition-smooth border hover:bg-panel-hover"
                  style={{ borderColor: 'var(--border-base)' }}
                >
                  <span className="hidden sm:inline">{player.displayName}</span>
                  <span className="sm:hidden">Profile</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="sticky top-16 z-20 backdrop-blur-xl bg-void/60 border-b" style={{ borderColor: 'var(--border-dim)' }}>
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {(['game', 'history', 'leaderboard'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setView(tab)}
                  className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium uppercase tracking-wider whitespace-nowrap transition-smooth border-b-2 ${
                    view === tab
                      ? 'text-cyan-400 border-cyan-400'
                      : 'text-muted border-transparent hover:text-primary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 pb-20">
          {loading ? (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="skeleton h-64 rounded-2xl" />
              <div className="skeleton h-32 rounded-2xl" />
            </div>
          ) : (
            <>
              {view === 'game' && (
                <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                  {/* Roll Section - Hero */}
                  <div className="scanlines">
                    <RollAnimation
                      rolling={rolling}
                      result={result}
                      onRoll={handleRoll}
                      hasRolledToday={hasRolledToday}
                      error={error}
                    />
                  </div>

                  {/* Badge Display */}
                  {result && (
                    <BadgeDisplay
                      badges={result.badges}
                      totalEP={result.totalEP}
                      rarity={result.rarity}
                      rollNumber={result.rollNumber}
                    />
                  )}

                  {/* Today's Top Rolls */}
                  {leaderboard.length > 0 && (
                    <div className="mt-12">
                      <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 text-muted">
                        <span className="text-cyan-400">$</span> Today's Top Rolls
                      </h2>
                      <Leaderboard rolls={leaderboard} />
                    </div>
                  )}
                </div>
              )}

              {view === 'history' && (
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
                    <span className="text-cyan-400">$</span>{' '}
                    <span className="bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent">
                      Your History
                    </span>
                  </h2>
                  <History rolls={history} />
                </div>
              )}

              {view === 'leaderboard' && (
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
                    <span className="text-cyan-400">$</span>{' '}
                    <span className="bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent">
                      Today's Leaderboard
                    </span>
                  </h2>
                  <Leaderboard rolls={leaderboard} />
                </div>
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t backdrop-blur-xl bg-void/80 mt-12" style={{ borderColor: 'var(--border-dim)' }}>
          <div className="container mx-auto px-4 sm:px-6 py-6 text-center text-muted text-xs sm:text-sm space-y-2">
            <p>Roll once per day (UTC) • Collect badges • Climb the leaderboard</p>
            <p className="text-dim">RNGTERM v1.0 • Powered by entropy</p>
          </div>
        </footer>
      </div>

      {/* Profile Panel Modal */}
      {showProfile && player && (
        <ProfilePanel
          player={player}
          onClose={() => setShowProfile(false)}
          onNameChange={handleNameChange}
        />
      )}
    </div>
  );
}
