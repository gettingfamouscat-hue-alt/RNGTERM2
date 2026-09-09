// Dynamic badge detection system that reads from DB
// SERVER ONLY - DO NOT IMPORT INTO CLIENT COMPONENTS
import { prisma } from './prisma';
import { SAFE_DETECTOR_PRESETS } from './badgePresets';

// Safe detector functions - no eval!
const DETECTOR_FUNCTIONS = {
  exact: (n: number, value: string) => n === parseInt(value),
  divisible: (n: number, value: string) => n % parseInt(value) === 0,
  contains: (n: number, value: string) => n.toString().includes(value),
  palindrome: (n: number) => {
    const str = n.toString().padStart(7, '0');
    return str === str.split('').reverse().join('');
  },
  range: (n: number, value: string) => {
    const [min, max] = value.split('-').map(v => parseInt(v));
    return n >= min && n <= max;
  },
  ends_with: (n: number, value: string) => n.toString().endsWith(value),
  starts_with: (n: number, value: string) => n.toString().startsWith(value),
  digit_sum: (n: number, value: string) => {
    const sum = n.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
    return sum === parseInt(value);
  },
  all_same_digit: (n: number) => {
    const digits = new Set(n.toString().padStart(7, '0'));
    return digits.size === 1;
  },
  ascending: (n: number) => {
    const digits = n.toString().padStart(7, '0').split('').map(Number);
    return digits.every((d, i) => i === 0 || d >= digits[i - 1]);
  },
  descending: (n: number) => {
    const digits = n.toString().padStart(7, '0').split('').map(Number);
    return digits.every((d, i) => i === 0 || d <= digits[i - 1]);
  },
};

export async function detectBadgesForRoll(rollNumber: number) {
  // Get all enabled badges from DB
  const badges = await prisma.badge.findMany({
    where: { enabled: true },
  });
  
  const earnedBadges = [];
  
  for (const badge of badges) {
    try {
      // Try dynamic detector first
      if (badge.detectorType && badge.detectorValue !== null) {
        const detector = DETECTOR_FUNCTIONS[badge.detectorType as keyof typeof DETECTOR_FUNCTIONS];
        if (detector) {
          const matches = detector.length === 1
            ? (detector as (n: number) => boolean)(rollNumber)
            : (detector as (n: number, v: string) => boolean)(rollNumber, badge.detectorValue);
          
          if (matches) {
            earnedBadges.push(badge);
          }
        }
      }
      // Fall back to hardcoded detectors from badges.ts for legacy badges
      else {
        // Import and check static detector
        const { BADGES } = await import('./badges');
        const staticBadge = BADGES.find(b => b.code === badge.code);
        if (staticBadge && staticBadge.detector(rollNumber)) {
          earnedBadges.push(badge);
        }
      }
    } catch (error) {
      console.error(`Error detecting badge ${badge.code}:`, error);
      // Skip this badge on error
    }
  }
  
  return earnedBadges;
}

// Re-export for convenience (but prefer importing from badgePresets.ts in client code)
export { SAFE_DETECTOR_PRESETS };
