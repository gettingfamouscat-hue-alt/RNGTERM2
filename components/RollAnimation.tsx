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
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (result && !animating) {
      setAnimating(true);
      setShowResult(false);
      
      // Fast scramble phase
      let count = 0;
      const interval = setInterval(() => {
        setDisplayNumber(Math.floor(Math.random() * 1000001));
        count++;
        if (count > 24) {
          clearInterval(interval);
          setDisplayNumber(result.rollNumber);
          setTimeout(() => {
            setAnimating(false);
            setShowResult(true);
          }, 300);
        }
      }, 40);
      
      return () => clearInterval(interval);
    }
  }, [result]);

  const getRarityClasses = (rarity: string) => {
    const classes: Record<string, string> = {
      Mythic: 'text-rarity-mythic glow-mythic',
      Anomaly: 'text-rarity-anomaly glow-anomaly',
      Epic: 'text-rarity-epic glow-epic',
      Rare: 'text-rarity-rare glow-rare',
      Uncommon: 'text-rarity-uncommon',
      Common: 'text-rarity-common',
      Trash: 'text-rarity-trash',
    };
    return classes[rarity] || 'text-primary';
  };

  return (
    <div className="relative">
      <div 
        className="rounded-2xl p-6 sm:p-8 lg:p-12 relative overflow-hidden border backdrop-blur-sm transition-smooth"
        style={{ 
          backgroundColor: 'var(--bg-panel)',
          borderColor: 'var(--border-base)',
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-cyan-400/50" />
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-cyan-400/50" />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-cyan-400/50" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-cyan-400/50" />
        
        <div className="text-center space-y-6 sm:space-y-8">
          {/* Title */}
          <div>
            <h2 className="text-sm sm:text-base font-medium uppercase tracking-widest text-cyan-400 mb-1">
              Daily Roll Terminal
            </h2>
            <p className="text-xs text-muted">0 → 1,000,000</p>
          </div>
          
          {/* Number Display */}
          <div className="py-8 sm:py-12">
            {displayNumber !== null ? (
              <div className="space-y-4">
                <div 
                  className={`text-5xl sm:text-7xl lg:text-8xl font-bold font-mono tracking-tight transition-all duration-300 ${
                    animating ? 'blur-sm opacity-50 scale-95' : `number-lock ${getRarityClasses(result?.rarity || '')}`
                  }`}
                >
                  {displayNumber.toLocaleString()}
                </div>
                
                {result && showResult && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={`text-2xl sm:text-3xl font-bold uppercase tracking-wider ${getRarityClasses(result.rarity)}`}>
                      {result.rarity}
                    </div>
                    {result.totalEP > 0 ? (
                      <div className="text-lg sm:text-xl font-mono ep-shimmer font-bold">
                        +{result.totalEP.toLocaleString()} EP
                      </div>
                    ) : (
                      <div className="text-lg text-muted">
                        No badges earned
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-7xl sm:text-8xl text-muted/30 font-mono">
                ??????
              </div>
            )}
          </div>
          
          {/* Error Message */}
          {error && (
            <div 
              className="p-4 rounded-xl border text-sm"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: '#ef4444',
                color: '#fca5a5',
              }}
            >
              {error}
            </div>
          )}
          
          {/* Roll Button */}
          <div className="space-y-4">
            <button
              onClick={onRoll}
              disabled={rolling || hasRolledToday}
              className={`
                w-full sm:w-auto px-8 sm:px-16 py-4 sm:py-5 
                text-base sm:text-lg font-bold uppercase tracking-wider
                rounded-xl border-2 transition-smooth btn-press
                ${hasRolledToday
                  ? 'border-dim text-dim cursor-not-allowed opacity-50'
                  : rolling
                  ? 'border-cyan-400 text-cyan-400 animate-pulse'
                  : 'border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-void hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]'
                }
              `}
            >
              {rolling && <span className="inline-block animate-spin mr-2">⟳</span>}
              {rolling ? 'Rolling...' : hasRolledToday ? 'Rolled Today' : 'Roll Now'}
            </button>
            
            {hasRolledToday && (
              <p className="text-xs sm:text-sm text-muted">
                Next roll in <span className="text-cyan-400 font-mono">{getTimeUntilNextRoll()}</span>
              </p>
            )}
          </div>
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
