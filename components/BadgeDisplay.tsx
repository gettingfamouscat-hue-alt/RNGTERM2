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
  const [visibleBadges, setVisibleBadges] = useState<Badge[]>([]);

  useEffect(() => {
    // Cascade badge reveal
    badges.forEach((badge, index) => {
      setTimeout(() => {
        setVisibleBadges(prev => [...prev, badge]);
      }, index * 150);
    });
    
    return () => setVisibleBadges([]);
  }, [badges]);

  const getRarityColor = (r: string) => {
    const colors: Record<string, string> = {
      Mythic: 'border-purple-400 bg-purple-500/20 text-purple-300',
      Anomaly: 'border-pink-400 bg-pink-500/20 text-pink-300',
      Epic: 'border-yellow-400 bg-yellow-500/20 text-yellow-300',
      Rare: 'border-blue-400 bg-blue-500/20 text-blue-300',
      Uncommon: 'border-green-400 bg-green-500/20 text-green-300',
      Common: 'border-gray-400 bg-gray-500/20 text-gray-300',
    };
    return colors[r] || 'border-gray-600 bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl text-cyan-400 mb-2 uppercase tracking-wider">
          Roll Analysis Complete
        </h3>
        <p className="text-green-600 text-sm">
          Number: <span className="text-green-400">{rollNumber.toLocaleString()}</span>
        </p>
      </div>

      {badges.length === 0 ? (
        <div className="border border-gray-700 bg-black/40 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-lg">No badges earned</p>
          <p className="text-gray-600 text-sm mt-2">Better luck next time!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {badges.map((badge, index) => (
            <div
              key={badge.id}
              className={`
                border-2 rounded-lg p-4 transition-all duration-500
                ${getRarityColor(badge.rarity)}
                ${visibleBadges.includes(badge) ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
              `}
              style={{
                animation: visibleBadges.includes(badge) ? 'badge-pop 0.5s ease-out' : undefined,
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-lg">{badge.name}</h4>
                <span className="text-xs uppercase font-bold px-2 py-1 border rounded">
                  {badge.rarity}
                </span>
              </div>
              <p className="text-sm opacity-80 mb-2">{badge.description}</p>
              <div className="text-xs font-mono">
                +{badge.epValue} EP
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes badge-pop {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
