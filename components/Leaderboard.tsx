'use client';

interface LeaderboardProps {
  rolls: any[];
}

export function Leaderboard({ rolls }: LeaderboardProps) {
  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      Mythic: 'text-purple-400',
      Anomaly: 'text-pink-400',
      Epic: 'text-yellow-400',
      Rare: 'text-blue-400',
      Uncommon: 'text-green-400',
      Common: 'text-gray-400',
      Trash: 'text-gray-600',
    };
    return colors[rarity] || 'text-white';
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'text-yellow-400';
    if (index === 1) return 'text-gray-300';
    if (index === 2) return 'text-orange-400';
    return 'text-green-600';
  };

  if (rolls.length === 0) {
    return (
      <div className="border border-gray-700 bg-black/40 rounded-lg p-8 text-center">
        <p className="text-gray-500">No rolls yet today</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-green-500/30 bg-black/40 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-green-500/30 bg-green-500/10">
              <th className="px-4 py-3 text-left text-sm font-bold text-cyan-400 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-cyan-400 uppercase tracking-wider">
                Player
              </th>
              <th className="px-4 py-3 text-right text-sm font-bold text-cyan-400 uppercase tracking-wider">
                Roll
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold text-cyan-400 uppercase tracking-wider">
                Rarity
              </th>
              <th className="px-4 py-3 text-right text-sm font-bold text-cyan-400 uppercase tracking-wider">
                EP
              </th>
              <th className="px-4 py-3 text-right text-sm font-bold text-cyan-400 uppercase tracking-wider">
                Badges
              </th>
            </tr>
          </thead>
          <tbody>
            {rolls.map((roll, index) => (
              <tr
                key={roll.id}
                className="border-b border-green-500/10 hover:bg-green-500/5 transition-colors"
              >
                <td className={`px-4 py-3 font-bold ${getRankColor(index)}`}>
                  #{index + 1}
                </td>
                <td className="px-4 py-3 text-green-400">
                  {roll.player?.displayName || 'Unknown'}
                </td>
                <td className="px-4 py-3 text-right font-mono text-white">
                  {roll.rollNumber.toLocaleString()}
                </td>
                <td className={`px-4 py-3 text-center font-bold ${getRarityColor(roll.rarity)}`}>
                  {roll.rarity}
                </td>
                <td className="px-4 py-3 text-right text-cyan-400 font-mono">
                  {roll.totalEP.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-green-600">
                  {roll.badges?.length || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
