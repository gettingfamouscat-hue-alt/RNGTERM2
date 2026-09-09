'use client';

interface HistoryProps {
  rolls: any[];
}

export function History({ rolls }: HistoryProps) {
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

  if (rolls.length === 0) {
    return (
      <div className="border border-gray-700 bg-black/40 rounded-lg p-8 text-center">
        <p className="text-gray-500 text-lg">No rolls yet</p>
        <p className="text-gray-600 text-sm mt-2">Roll today to start your history!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rolls.map((roll) => (
        <div
          key={roll.id}
          className="border-2 border-green-500/30 bg-black/40 rounded-lg p-6 hover:border-green-500/50 transition-colors"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-white font-mono mb-2">
                {roll.rollNumber.toLocaleString()}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className={`font-bold uppercase ${getRarityColor(roll.rarity)}`}>
                  {roll.rarity}
                </span>
                <span className="text-cyan-400">
                  +{roll.totalEP.toLocaleString()} EP
                </span>
                <span className="text-green-600">
                  {new Date(roll.rollDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-right text-green-400 font-bold">
                {roll.badges?.length || 0} Badges
              </div>
            </div>
          </div>

          {roll.badges && roll.badges.length > 0 && (
            <div className="border-t border-green-500/20 pt-4">
              <div className="flex flex-wrap gap-2">
                {roll.badges.map((badge: any) => (
                  <div
                    key={badge.id}
                    className="px-3 py-1 border border-green-500/30 rounded bg-green-500/5 text-xs text-green-400"
                  >
                    {badge.name} <span className="text-green-600">+{badge.epValue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
