'use client';

interface HistoryProps {
  rolls: any[];
}

export function History({ rolls }: HistoryProps) {
  const getRarityClasses = (rarity: string) => {
    return `text-rarity-${rarity.toLowerCase()}`;
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
        <div className="text-6xl mb-4 opacity-20">📜</div>
        <p className="text-lg font-medium text-muted mb-1">No rolls yet</p>
        <p className="text-sm text-dim">Roll today to start your history!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {rolls.map((roll) => (
        <div
          key={roll.id}
          className="rounded-xl border p-4 sm:p-6 transition-smooth hover:bg-panel-hover"
          style={{
            backgroundColor: 'var(--bg-panel)',
            borderColor: 'var(--border-base)',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold font-mono text-primary">
                {roll.rollNumber.toLocaleString()}
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className={`font-bold uppercase ${getRarityClasses(roll.rarity)}`}>
                  {roll.rarity}
                </span>
                <span className="text-cyan-400 font-mono">
                  +{roll.totalEP.toLocaleString()} EP
                </span>
                <span className="text-muted">
                  {new Date(roll.rollDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
            
            <div className="text-left sm:text-right">
              <div className="text-2xl font-bold text-cyan-400">
                {roll.badges?.length || 0}
              </div>
              <div className="text-xs text-muted uppercase tracking-wide">
                Badges
              </div>
            </div>
          </div>

          {roll.badges && roll.badges.length > 0 && (
            <div 
              className="border-t pt-4 space-y-2"
              style={{ borderColor: 'var(--border-dim)' }}
            >
              <div className="text-xs text-muted uppercase tracking-wider mb-2">
                Earned Badges
              </div>
              <div className="flex flex-wrap gap-2">
                {roll.badges.map((badge: any) => (
                  <div
                    key={badge.id}
                    className={`
                      px-3 py-1.5 rounded-lg border text-xs font-medium
                      ${`border-rarity-${badge.rarity.toLowerCase()} bg-rarity-${badge.rarity.toLowerCase()} text-rarity-${badge.rarity.toLowerCase()}`}
                    `}
                  >
                    <span className="font-bold">{badge.name}</span>
                    <span className="opacity-60 ml-1.5">+{badge.epValue}</span>
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
