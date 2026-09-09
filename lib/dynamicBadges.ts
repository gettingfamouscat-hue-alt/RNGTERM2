// Dynamic badge detection system that reads from DB
import { prisma } from './prisma';

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
          // Normalize arity: 1-arg detectors ignore value; 2-arg detectors use detectorValue
          const matches = (detector as (n: number, value?: string | null) => boolean)(
            rollNumber,
            badge.detectorValue,
          );
          
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

export const SAFE_DETECTOR_PRESETS = [
  { type: 'exact', label: 'Exact Number', example: '777', description: 'Matches exactly this number' },
  { type: 'divisible', label: 'Divisible By', example: '13', description: 'Number is divisible by this value' },
  { type: 'contains', label: 'Contains Digit(s)', example: '69', description: 'Number contains these digits' },
  { type: 'palindrome', label: 'Palindrome', example: '', description: 'Number reads same forwards and backwards' },
  { type: 'range', label: 'In Range', example: '100-200', description: 'Number is between min and max (format: min-max)' },
  { type: 'ends_with', label: 'Ends With', example: '00', description: 'Number ends with these digits' },
  { type: 'starts_with', label: 'Starts With', example: '1', description: 'Number starts with these digits' },
  { type: 'digit_sum', label: 'Digit Sum Equals', example: '42', description: 'Sum of all digits equals this' },
  { type: 'all_same_digit', label: 'All Same Digit', example: '', description: 'All digits are identical (e.g., 777777)' },
  { type: 'ascending', label: 'Ascending Digits', example: '', description: 'Digits in ascending order (e.g., 123456)' },
  { type: 'descending', label: 'Descending Digits', example: '', description: 'Digits in descending order (e.g., 654321)' },
];
