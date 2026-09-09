'use client';

import { useState, useEffect } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  rarity: string;
  epValue: number;
}

interface BadgeDisplayProps {
  badges: Badge[];
  totalEP: number;
  rarity: string;
  rollNumber: number;
}

export function BadgeDisplay({ badges, totalEP, rarity, rollNumber }: BadgeDisplayProps) {
  const [visibleBadges, setVisibleBadges] = useState<string[]>([]);

  useEffect(() => {
    setVisibleBadges([]);
    // Lunar dust cascade - staggered badge appearance
    badges.forEach((badge, index) => {
      setTimeout(() => {
        setVisibleBadges(prev => [...prev, badge.id]);
      }, index * 150 + 400);
    });
  }, [badges]);

  const getRarityClasses = (r: string) => {
    return `border-rarity-${r.toLowerCase()} bg-rarity-${r.toLowerCase()} text-rarity-${r.toLowerCase()}`;
  };

  if (badges.length === 0) {
    return (
      <div 
        className="rounded-2xl p-8 text-center border"
        style={{
          backgroundColor: 'var(--bg-panel)',
          borderColor: 'var(--border-dim)',
        }}
      >
        <div className="text-6xl mb-4 opacity-20">∅</div>
        <p className="text-lg font-medium text-muted mb-1">No badges earned</p>
        <p className="text-sm text-dim">Better luck on your next roll!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold text-primary">
          Analysis Complete
        </h3>
        <p className="text-sm text-muted">
          Roll: <span className="text-cyan-400 font-mono">{rollNumber.toLocaleString()}</span>
        </p>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`
              rounded-xl p-4 border-2 transition-all duration-300
              ${getRarityClasses(badge.rarity)}
              ${visibleBadges.includes(badge.id) ? 'badge-cascade' : 'opacity-0'}
            `}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="font-bold text-base sm:text-lg leading-tight flex-1">
                {badge.name}
              </h4>
              <span 
                className="text-xs font-bold uppercase px-2 py-1 rounded border whitespace-nowrap"
                style={{ opacity: 0.8 }}
              >
                {badge.rarity}
              </span>
            </div>
            
            <p className="text-sm opacity-90 mb-3 leading-relaxed">
              {badge.description}
            </p>
            
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold">+{badge.epValue} EP</span>
              {badge.rarity === 'Mythic' && <span className="opacity-60">✦</span>}
              {badge.rarity === 'Anomaly' && <span className="opacity-60">◆</span>}
              {badge.rarity === 'Epic' && <span className="opacity-60">●</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
