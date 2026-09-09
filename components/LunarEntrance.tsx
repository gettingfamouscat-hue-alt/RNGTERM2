'use client';

import { useEffect, useState } from 'react';

export function LunarEntrance() {
  const [hasVisited, setHasVisited] = useState(true);

  useEffect(() => {
    // Check if user has visited this session
    const visited = sessionStorage.getItem('lunar_visited');
    if (!visited) {
      setHasVisited(false);
      sessionStorage.setItem('lunar_visited', 'true');
      
      // Cleanup after animation
      setTimeout(() => {
        setHasVisited(true);
      }, 2000);
    }
  }, []);

  if (hasVisited) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none lunar-entrance">
      {/* Moonrise glow */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-300/20 via-transparent to-transparent animate-moon-bloom" />
      
      {/* Stars fading in */}
      <div className="stars-fade">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-star-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.8}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        .lunar-entrance {
          animation: fade-out 0.5s ease-out 1.5s forwards;
        }

        @keyframes moon-bloom {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          60% {
            opacity: 1;
            transform: scale(1.2);
          }
          100% {
            opacity: 0.8;
            transform: scale(1);
          }
        }

        .animate-moon-bloom {
          animation: moon-bloom 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes star-twinkle {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-star-twinkle {
          animation: star-twinkle 1.5s ease-in-out forwards;
        }

        @keyframes fade-out {
          to {
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .lunar-entrance {
            animation: fade-out 0.1s ease-out forwards;
          }
          .animate-moon-bloom {
            animation: none;
          }
          .animate-star-twinkle {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
