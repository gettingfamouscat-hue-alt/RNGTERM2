'use client';

import { useState, useEffect } from 'react';

interface RollAnimationProps {
  rolling: boolean;
  result: { rollNumber: number; totalEP: number; rarity: string } | null;
  onRoll: () => void;
  hasRolledToday: boolean;
  error: string | null;
}

export function RollAnimation({ rolling, result, onRoll, hasRolledToday, error }: RollAnimationProps) {
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (result && !animating) {
      setAnimating(true);
      // Animate number reveal
      let count = 0;
      const interval = setInterval(() => {
        setDisplayNumber(Math.floor(Math.random() * 1000001));
        count++;
        if (count > 20) {
          clearInterval(interval);
          setDisplayNumber(result.rollNumber);
          setTimeout(() => setAnimating(false), 500);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [result]);

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      Mythic: 'text-purple-400 glow-purple',
      Anomaly: 'text-pink-400 glow-pink',
      Epic: 'text-yellow-400 glow-yellow',
      Rare: 'text-blue-400 glow-blue',
      Uncommon: 'text-green-400 glow-green',
      Common: 'text-gray-400',
      Trash: 'text-gray-600',
    };
    return colors[rarity] || 'text-white';
  };

  return (
    <div className="relative">
      {/* Scanline effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-scanline pointer-events-none" />
      
      <div className="border-2 border-green-500/50 bg-black/60 backdrop-blur-sm rounded-lg p-8 relative overflow-hidden">
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />
        
        <div className="text-center">
          <h2 className="text-xl text-green-400 mb-6 uppercase tracking-widest">
            &gt; Daily Roll Terminal
          </h2>
          
          {displayNumber !== null && (
            <div className="mb-8">
              <div className={`text-7xl font-bold mb-4 ${animating ? 'text-white blur-sm' : getRarityColor(result?.rarity || '')}`}>
                {displayNumber.toLocaleString()}
              </div>
              {result && !animating && (
                <div className="space-y-2">
                  <div className={`text-2xl font-bold uppercase tracking-widest ${getRarityColor(result.rarity)}`}>
                    {result.rarity}
                  </div>
                  <div className="text-lg text-cyan-400">
                    +{result.totalEP.toLocaleString()} EP
                  </div>
                </div>
              )}
            </div>
          )}
          
          {!result && !rolling && (
            <div className="mb-8 text-6xl text-green-600">
              ??????
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 border border-red-500/50 bg-red-500/10 rounded text-red-400">
              {error}
            </div>
          )}
          
          <button
            onClick={onRoll}
            disabled={rolling || hasRolledToday}
            className={`
              relative px-12 py-4 text-xl font-bold uppercase tracking-wider
              border-2 rounded transition-all duration-200
              ${hasRolledToday
                ? 'border-gray-700 text-gray-700 cursor-not-allowed'
                : rolling
                ? 'border-yellow-400 text-yellow-400 animate-pulse'
                : 'border-green-400 text-green-400 hover:bg-green-400 hover:text-black hover:shadow-[0_0_30px_rgba(74,222,128,0.5)]'
              }
            `}
          >
            {rolling && <span className="inline-block animate-spin mr-2">⟳</span>}
            {rolling ? 'ROLLING...' : hasRolledToday ? 'COME BACK TOMORROW' : 'ROLL NOW'}
          </button>
          
          {hasRolledToday && (
            <p className="mt-4 text-sm text-green-600">
              Next roll available in {getTimeUntilNextRoll()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function getTimeUntilNextRoll() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  
  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}
