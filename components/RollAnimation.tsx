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
      
      // Lunar-themed roll sequence
      let count = 0;
      const phases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
      let phaseIndex = 0;
      
      const interval = setInterval(() => {
        setDisplayNumber(Math.floor(Math.random() * 1000001));
        phaseIndex = (phaseIndex + 1) % phases.length;
        count++;
        
        if (count > 25) {
          clearInterval(interval);
          // Final lunar glow
          setDisplayNumber(result.rollNumber);
          setTimeout(() => {
            setAnimating(false);
            setShowResult(true);
          }, 500);
        }
      }, 60);
      
      return () => clearInterval(interval);
    }
  }, [result]);

  const getRarityClasses = (rarity: string) => {
    const classes: Record<string, string> = {
      Mythic: 'text-rarity-mythic glow-mythic',
      Anomaly: 'text-rarity-anomaly glow-anomaly',
      Epic: 'text-rarity-epic glow-epic',
      Rare: 'text-rarity-rare glow-rare',
      Uncommon: 'text-rarity-uncommon glow-uncommon',
      Common: 'text-rarity-common',
      Trash: 'text-rarity-trash',
    };
    return classes[rarity] || 'text-silver';
  };

  return (
    <div className="relative">
      {/* Moonlight glow behind card - intensifies during roll */}
      <div className={`absolute inset-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent blur-3xl transition-all duration-500 ${
        animating ? 'opacity-100 scale-110' : 'opacity-60'
      }`} />
      
      {/* Orbiting dust particles during roll */}
      {animating && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-200/60 rounded-full animate-orbit-dust"
              style={{
                left: '50%',
                top: '50%',
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${1.5 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}
      
      <div 
        className="glass-panel rounded-3xl p-6 sm:p-12 relative overflow-hidden transition-lunar"
      >
        {/* Soft corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t border-l opacity-30" style={{ borderColor: 'var(--accent-moon)' }} />
        <div className="absolute top-0 right-0 w-16 h-16 border-t border-r opacity-30" style={{ borderColor: 'var(--accent-moon)' }} />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l opacity-30" style={{ borderColor: 'var(--accent-moon)' }} />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r opacity-30" style={{ borderColor: 'var(--accent-moon)' }} />
        
        <div className="text-center space-y-8">
          {/* Title */}
          <div>
            <h2 className="text-base sm:text-lg font-medium tracking-widest mb-2" style={{ color: 'var(--text-silver)' }}>
              Daily Lunar Roll
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>0 → 1,000,000</p>
          </div>
          
          {/* Number Display */}
          <div className="py-8 sm:py-16">
            {displayNumber !== null ? (
              <div className="space-y-6">
                <div 
                  className={`text-5xl sm:text-7xl lg:text-8xl font-bold font-mono tracking-tight transition-all duration-300 ${
                    animating ? 'blur-sm opacity-40 scale-95' : `number-settle ${getRarityClasses(result?.rarity || '')}`
                  }`}
                >
                  {displayNumber.toLocaleString()}
                </div>
                
                {result && showResult && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className={`text-2xl sm:text-3xl font-bold uppercase tracking-wider ${getRarityClasses(result.rarity)}`}>
                      {result.rarity}
                    </div>
                    {result.totalEP > 0 ? (
                      <div className="text-xl sm:text-2xl font-mono lunar-shimmer font-bold">
                        +{result.totalEP.toLocaleString()} EP
                      </div>
                    ) : (
                      <div className="text-lg" style={{ color: 'var(--text-muted)' }}>
                        No badges earned
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-7xl sm:text-8xl font-mono" style={{ color: 'var(--text-dim)' }}>
                ??????
              </div>
            )}
          </div>
          
          {/* Error Message */}
          {error && (
            <div 
              className="p-4 rounded-xl border text-sm glass-panel"
              style={{
                borderColor: '#f87171',
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
                w-full sm:w-auto px-12 sm:px-20 py-4 sm:py-5 
                text-base sm:text-lg font-bold uppercase tracking-wider
                rounded-xl border-2 transition-lunar btn-lunar
                ${hasRolledToday
                  ? 'opacity-40 cursor-not-allowed'
                  : rolling
                  ? 'animate-pulse'
                  : 'hover:shadow-[0_0_30px_rgba(219,234,254,0.3)]'
                }
              `}
              style={{
                borderColor: hasRolledToday ? 'var(--border-dim)' : 'var(--accent-moon)',
                color: hasRolledToday ? 'var(--text-dim)' : 'var(--accent-moon)',
                backgroundColor: hasRolledToday ? 'transparent' : rolling ? 'rgba(219, 234, 254, 0.05)' : 'transparent',
              }}
            >
              {rolling && <span className="inline-block animate-spin mr-2">◐</span>}
              {rolling ? 'Rolling...' : hasRolledToday ? 'Rolled Today' : 'Roll Now'}
            </button>
            
            {hasRolledToday && (
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                Next roll in <span className="font-mono" style={{ color: 'var(--accent-blue)' }}>{getTimeUntilNextRoll()}</span>
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
