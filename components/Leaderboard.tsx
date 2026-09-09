'use client';

interface LeaderboardProps {
  rolls: any[];
}

export function Leaderboard({ rolls }: LeaderboardProps) {
  const getRarityClasses = (rarity: string) => {
    return `text-rarity-${rarity.toLowerCase()}`;
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return '👑';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'text-rarity-mythic';
    if (index === 1) return 'text-rarity-common';
    if (index === 2) return 'text-rarity-uncommon';
    return 'text-muted';
  };

  if (rolls.length === 0) {
    return (
      <div 
        className="rounded-2xl p-12 text-center border"
        style={{
          backgroundColor: 'var(--bg-panel)',
          borderColor: 'var(--border-dim)',
        }}
      >
        <div className="text-6xl mb-4 opacity-20">📊</div>
        <p className="text-lg font-medium text-muted mb-1">No rolls yet today</p>
        <p className="text-sm text-dim">Be the first to roll!</p>
      </div>
    );
  }

  return (
    <div 
      className="rounded-2xl overflow-hidden border"
      style={{
        backgroundColor: 'var(--bg-panel)',
        borderColor: 'var(--border-base)',
      }}
    >
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
              <th className="px-4 py-3 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Player
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Roll
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Rarity
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold text-cyan-400 uppercase tracking-wider">
                EP
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Badges
              </th>
            </tr>
          </thead>
          <tbody>
            {rolls.map((roll, index) => (
              <tr
                key={roll.id}
                className="border-t transition-smooth hover:bg-panel-hover"
                style={{ borderColor: 'var(--border-dim)' }}
              >
                <td className={`px-4 py-3 font-bold ${getRankColor(index)}`}>
                  {getRankBadge(index)}
                </td>
                <td className="px-4 py-3 text-primary">
                  {roll.displayName || 'Unknown'}
                </td>
                <td className="px-4 py-3 text-right font-mono text-primary">
                  {roll.rollNumber.toLocaleString()}
                </td>
                <td className={`px-4 py-3 text-center font-bold text-sm ${getRarityClasses(roll.rarity)}`}>
                  {roll.rarity}
                </td>
                <td className="px-4 py-3 text-right text-cyan-400 font-mono">
                  {roll.totalEP.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-muted">
                  {roll.badges?.length || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden divide-y" style={{ borderColor: 'var(--border-dim)' }}>
        {rolls.map((roll, index) => (
          <div key={roll.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-lg font-bold ${getRankColor(index)}`}>
                {getRankBadge(index)}
              </span>
              <span className={`text-sm font-bold ${getRarityClasses(roll.rarity)}`}>
                {roll.rarity}
              </span>
            </div>
            
            <div className="text-primary font-medium">
              {roll.displayName || 'Unknown'}
            </div>
            
            <div className="text-2xl font-mono font-bold text-primary">
              {roll.rollNumber.toLocaleString()}
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-cyan-400 font-mono">
                {roll.totalEP.toLocaleString()} EP
              </span>
              <span className="text-muted">
                {roll.badges?.length || 0} badges
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
