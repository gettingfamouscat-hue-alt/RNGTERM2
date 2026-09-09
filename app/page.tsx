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
    }
  }

  async function handleRoll() {
    try {
      setError(null);
      setRolling(true);
      const rollResult = await performRoll();
      setResult(rollResult);
      // Reload data after successful roll
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
    <div className="min-h-screen bg-black text-green-400 font-mono overflow-x-hidden">
      {/* Terminal glow background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-black to-black pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-green-500/30 bg-black/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-green-400 tracking-wider flex items-center gap-2">
              <span className="text-cyan-400">&gt;</span> RNGTERM
              <span className="animate-pulse text-yellow-400">_</span>
            </h1>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="px-4 py-2 border border-green-500/50 rounded hover:bg-green-500/10 transition-colors text-sm"
            >
              {player?.displayName || 'Loading...'}
            </button>
          </div>
        </header>

        {/* Profile Panel */}
        {showProfile && player && (
          <ProfilePanel
            player={player}
            onClose={() => setShowProfile(false)}
            onNameChange={handleNameChange}
          />
        )}

        {/* Navigation */}
        <nav className="border-b border-green-500/20 bg-black/60 backdrop-blur-sm sticky top-0 z-20">
          <div className="container mx-auto px-4">
            <div className="flex gap-1">
              {(['game', 'history', 'leaderboard'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setView(tab)}
                  className={`px-6 py-3 text-sm uppercase tracking-wider transition-colors border-b-2 ${
                    view === tab
                      ? 'border-green-400 text-green-400 bg-green-500/10'
                      : 'border-transparent text-green-600 hover:text-green-400 hover:bg-green-500/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {view === 'game' && (
            <div className="max-w-4xl mx-auto">
              {/* Roll Section */}
              <div className="mb-8">
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
                <div className="mb-8">
                  <BadgeDisplay
                    badges={result.badges}
                    totalEP={result.totalEP}
                    rarity={result.rarity}
                    rollNumber={result.rollNumber}
                  />
                </div>
              )}

              {/* Today's Top Rolls */}
              {leaderboard.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                    <span className="text-green-400">$</span> Today's Top Rolls
                  </h2>
                  <Leaderboard rolls={leaderboard} />
                </div>
              )}
            </div>
          )}

          {view === 'history' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                <span className="text-green-400">$</span> Your Roll History
              </h2>
              <History rolls={history} />
            </div>
          )}

          {view === 'leaderboard' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                <span className="text-green-400">$</span> Today's Leaderboard
              </h2>
              <Leaderboard rolls={leaderboard} />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-green-500/20 bg-black/80 backdrop-blur-sm mt-20">
          <div className="container mx-auto px-4 py-6 text-center text-green-600 text-sm">
            <p>Roll once per day (UTC) • Collect badges • Climb the leaderboard</p>
            <p className="mt-2 text-green-700">RNGTERM v1.0.0 | Powered by entropy</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
