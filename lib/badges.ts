// Badge detection system for RNG rolls (0 - 1,000,000)

export interface BadgeDefinition {
  code: string;
  name: string;
  description: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Anomaly' | 'Mythic';
  epValue: number;
  detector: (n: number) => boolean;
}

// Helper: convert number to zero-padded 7-digit string
const toDigitString = (n: number): string => n.toString().padStart(7, '0');

// Helper: get digit array
const getDigits = (n: number): number[] => toDigitString(n).split('').map(Number);

// Helper: check if prime
const isPrime = (n: number): boolean => {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
};

// Helper: check if perfect square
const isPerfectSquare = (n: number): boolean => {
  const sqrt = Math.sqrt(n);
  return sqrt === Math.floor(sqrt);
};

// Helper: check if perfect cube
const isPerfectCube = (n: number): boolean => {
  const cbrt = Math.cbrt(n);
  return Math.abs(cbrt - Math.round(cbrt)) < 1e-10;
};

// Helper: check if Fibonacci number
const isFibonacci = (n: number): boolean => {
  return isPerfectSquare(5 * n * n + 4) || isPerfectSquare(5 * n * n - 4);
};

export const BADGES: BadgeDefinition[] = [
  // Extreme values - Mythic
  {
    code: 'absolute_zero',
    name: 'Absolute Zero',
    description: 'Rolled exactly 0',
    rarity: 'Mythic',
    epValue: 10000,
    detector: (n) => n === 0,
  },
  {
    code: 'one_in_a_million',
    name: 'One in a Million',
    description: 'Rolled exactly 1,000,000',
    rarity: 'Mythic',
    epValue: 10000,
    detector: (n) => n === 1000000,
  },
  
  // All same digit - Mythic/Anomaly
  {
    code: 'seven_heavens',
    name: 'Seventh Heaven',
    description: 'All seven digits are 7s',
    rarity: 'Mythic',
    epValue: 8000,
    detector: (n) => toDigitString(n) === '0777777',
  },
  {
    code: 'all_ones',
    name: 'Snake Eyes Forever',
    description: 'All digits are 1s',
    rarity: 'Mythic',
    epValue: 7500,
    detector: (n) => toDigitString(n) === '0111111',
  },
  {
    code: 'all_eights',
    name: 'Infinite Loop',
    description: 'All digits are 8s',
    rarity: 'Mythic',
    epValue: 7500,
    detector: (n) => toDigitString(n) === '0888888',
  },
  {
    code: 'all_nines',
    name: 'Cloud Nine',
    description: 'All digits are 9s',
    rarity: 'Mythic',
    epValue: 7500,
    detector: (n) => toDigitString(n) === '0999999',
  },

  // Perfect palindrome - Anomaly
  {
    code: 'perfect_palindrome',
    name: 'Mirror Image',
    description: 'Number reads the same forwards and backwards',
    rarity: 'Anomaly',
    epValue: 3000,
    detector: (n) => {
      const str = toDigitString(n);
      return str === str.split('').reverse().join('');
    },
  },

  // Ascending/Descending sequences - Epic/Anomaly
  {
    code: 'ascending_all',
    name: 'Stairway to Heaven',
    description: 'All digits in ascending order',
    rarity: 'Anomaly',
    epValue: 4000,
    detector: (n) => {
      const digits = getDigits(n);
      return digits.every((d, i) => i === 0 || d >= digits[i - 1]);
    },
  },
  {
    code: 'descending_all',
    name: 'Downward Spiral',
    description: 'All digits in descending order',
    rarity: 'Anomaly',
    epValue: 4000,
    detector: (n) => {
      const digits = getDigits(n);
      return digits.every((d, i) => i === 0 || d <= digits[i - 1]);
    },
  },
  {
    code: 'sequential_run',
    name: 'Consecutive Streak',
    description: 'Contains 5+ consecutive digits (e.g., 34567)',
    rarity: 'Epic',
    epValue: 2000,
    detector: (n) => {
      const digits = getDigits(n);
      let maxRun = 1, currentRun = 1;
      for (let i = 1; i < digits.length; i++) {
        if (digits[i] === digits[i - 1] + 1) {
          currentRun++;
          maxRun = Math.max(maxRun, currentRun);
        } else {
          currentRun = 1;
        }
      }
      return maxRun >= 5;
    },
  },

  // Repeating patterns - Epic
  {
    code: 'three_of_a_kind',
    name: 'Triple Threat',
    description: 'Three of the same digit appear',
    rarity: 'Rare',
    epValue: 500,
    detector: (n) => {
      const digits = getDigits(n);
      const counts = new Map<number, number>();
      digits.forEach(d => counts.set(d, (counts.get(d) || 0) + 1));
      return Array.from(counts.values()).some(c => c >= 3);
    },
  },
  {
    code: 'four_of_a_kind',
    name: 'Quad Squad',
    description: 'Four of the same digit appear',
    rarity: 'Epic',
    epValue: 1500,
    detector: (n) => {
      const digits = getDigits(n);
      const counts = new Map<number, number>();
      digits.forEach(d => counts.set(d, (counts.get(d) || 0) + 1));
      return Array.from(counts.values()).some(c => c >= 4);
    },
  },
  {
    code: 'five_of_a_kind',
    name: 'Quintuple Crown',
    description: 'Five of the same digit appear',
    rarity: 'Anomaly',
    epValue: 3500,
    detector: (n) => {
      const digits = getDigits(n);
      const counts = new Map<number, number>();
      digits.forEach(d => counts.set(d, (counts.get(d) || 0) + 1));
      return Array.from(counts.values()).some(c => c >= 5);
    },
  },

  // Pairs - Common/Uncommon
  {
    code: 'two_pair',
    name: 'Double Trouble',
    description: 'Two different pairs of digits',
    rarity: 'Uncommon',
    epValue: 200,
    detector: (n) => {
      const digits = getDigits(n);
      const counts = new Map<number, number>();
      digits.forEach(d => counts.set(d, (counts.get(d) || 0) + 1));
      const pairs = Array.from(counts.values()).filter(c => c >= 2);
      return pairs.length >= 2;
    },
  },
  {
    code: 'full_house',
    name: 'Full House',
    description: 'Three of one digit and two of another',
    rarity: 'Rare',
    epValue: 800,
    detector: (n) => {
      const digits = getDigits(n);
      const counts = new Map<number, number>();
      digits.forEach(d => counts.set(d, (counts.get(d) || 0) + 1));
      const values = Array.from(counts.values()).sort((a, b) => b - a);
      return values.length >= 2 && values[0] >= 3 && values[1] >= 2;
    },
  },

  // Alternating pattern - Epic
  {
    code: 'alternating',
    name: 'Zigzag',
    description: 'Digits alternate between two values',
    rarity: 'Epic',
    epValue: 2500,
    detector: (n) => {
      const digits = getDigits(n);
      const unique = [...new Set(digits)];
      if (unique.length !== 2) return false;
      return digits.every((d, i) => i === 0 || d !== digits[i - 1]);
    },
  },

  // Math properties - Rare/Epic
  {
    code: 'prime_number',
    name: 'Prime Time',
    description: 'Number is prime',
    rarity: 'Rare',
    epValue: 600,
    detector: (n) => isPrime(n),
  },
  {
    code: 'perfect_square',
    name: 'Square Deal',
    description: 'Number is a perfect square',
    rarity: 'Uncommon',
    epValue: 300,
    detector: (n) => isPerfectSquare(n),
  },
  {
    code: 'perfect_cube',
    name: 'Cube Root',
    description: 'Number is a perfect cube',
    rarity: 'Rare',
    epValue: 700,
    detector: (n) => isPerfectCube(n),
  },
  {
    code: 'fibonacci',
    name: 'Golden Ratio',
    description: 'Number is in the Fibonacci sequence',
    rarity: 'Epic',
    epValue: 1800,
    detector: (n) => isFibonacci(n),
  },

  // Divisibility - Common/Uncommon/Rare
  {
    code: 'div_by_69',
    name: 'Nice',
    description: 'Divisible by 69',
    rarity: 'Uncommon',
    epValue: 250,
    detector: (n) => n % 69 === 0,
  },
  {
    code: 'div_by_420',
    name: 'Blaze It',
    description: 'Divisible by 420',
    rarity: 'Rare',
    epValue: 600,
    detector: (n) => n % 420 === 0,
  },
  {
    code: 'div_by_1337',
    name: 'Leet',
    description: 'Divisible by 1337',
    rarity: 'Rare',
    epValue: 650,
    detector: (n) => n % 1337 === 0,
  },
  {
    code: 'div_by_7',
    name: 'Lucky Seven',
    description: 'Divisible by 7',
    rarity: 'Common',
    epValue: 100,
    detector: (n) => n % 7 === 0,
  },

  // Cultural/Meme numbers - Rare/Epic/Anomaly
  {
    code: 'sixty_nine',
    name: 'Nice',
    description: 'Rolled exactly 69',
    rarity: 'Rare',
    epValue: 690,
    detector: (n) => n === 69,
  },
  {
    code: 'four_twenty',
    name: '420 Blaze It',
    description: 'Rolled exactly 420',
    rarity: 'Rare',
    epValue: 800,
    detector: (n) => n === 420,
  },
  {
    code: 'number_of_the_beast',
    name: 'Number of the Beast',
    description: 'Rolled exactly 666',
    rarity: 'Epic',
    epValue: 1666,
    detector: (n) => n === 666,
  },
  {
    code: 'lucky_sevens',
    name: 'Jackpot',
    description: 'Rolled exactly 777',
    rarity: 'Epic',
    epValue: 1777,
    detector: (n) => n === 777,
  },
  {
    code: 'leet_speak',
    name: '1337 H4X0R',
    description: 'Rolled exactly 1337',
    rarity: 'Epic',
    epValue: 1337,
    detector: (n) => n === 1337,
  },
  {
    code: 'boobies',
    name: 'Calculator Classic',
    description: 'Rolled exactly 8008 or 80085',
    rarity: 'Rare',
    epValue: 808,
    detector: (n) => n === 8008 || n === 80085,
  },
  {
    code: 'the_answer',
    name: 'The Answer',
    description: 'Rolled exactly 42',
    rarity: 'Rare',
    epValue: 420,
    detector: (n) => n === 42,
  },

  // Even/Odd - Common (only for edge cases)
  {
    code: 'perfectly_even',
    name: 'Even Steven',
    description: 'All digits are even',
    rarity: 'Uncommon',
    epValue: 150,
    detector: (n) => getDigits(n).every(d => d % 2 === 0),
  },
  {
    code: 'perfectly_odd',
    name: 'Odd One Out',
    description: 'All digits are odd',
    rarity: 'Uncommon',
    epValue: 150,
    detector: (n) => getDigits(n).every(d => d % 2 === 1),
  },

  // Special patterns - Epic/Anomaly
  {
    code: 'bookends',
    name: 'Bookends',
    description: 'First and last digit are the same',
    rarity: 'Common',
    epValue: 80,
    detector: (n) => {
      const str = toDigitString(n);
      return str[0] === str[6];
    },
  },
  {
    code: 'no_repeats',
    name: 'All Unique',
    description: 'No digit appears more than once',
    rarity: 'Uncommon',
    epValue: 180,
    detector: (n) => {
      const digits = getDigits(n);
      return new Set(digits).size === digits.length;
    },
  },
  {
    code: 'sum_is_42',
    name: 'Sum of All Parts',
    description: 'Digits sum to 42',
    rarity: 'Rare',
    epValue: 420,
    detector: (n) => getDigits(n).reduce((a, b) => a + b, 0) === 42,
  },
  {
    code: 'binary_like',
    name: 'Digital Binary',
    description: 'Only contains 0s and 1s',
    rarity: 'Epic',
    epValue: 2100,
    detector: (n) => getDigits(n).every(d => d === 0 || d === 1),
  },
  {
    code: 'no_zeros',
    name: 'Zero Free',
    description: 'No zeros in the number',
    rarity: 'Uncommon',
    epValue: 120,
    detector: (n) => !toDigitString(n).includes('0'),
  },
  {
    code: 'half_and_half',
    name: 'Balanced',
    description: 'First half mirrors second half',
    rarity: 'Anomaly',
    epValue: 3200,
    detector: (n) => {
      const str = toDigitString(n);
      const half = Math.floor(str.length / 2);
      return str.slice(0, half) === str.slice(-half);
    },
  },

  // Power numbers - Rare
  {
    code: 'power_of_two',
    name: 'Binary Power',
    description: 'Number is a power of 2',
    rarity: 'Rare',
    epValue: 750,
    detector: (n) => n > 0 && (n & (n - 1)) === 0,
  },
  {
    code: 'round_number',
    name: 'Nice and Round',
    description: 'Divisible by 10,000',
    rarity: 'Rare',
    epValue: 500,
    detector: (n) => n % 10000 === 0 && n > 0,
  },
];

// Calculate EP and rarity
export function analyzeRoll(n: number): {
  badges: BadgeDefinition[];
  totalEP: number;
  rarity: string;
} {
  const badges = BADGES.filter(badge => badge.detector(n));
  const totalEP = badges.reduce((sum, badge) => sum + badge.epValue, 0);
  
  let rarity = 'Trash';
  if (totalEP >= 8000) rarity = 'Mythic';
  else if (totalEP >= 3000) rarity = 'Anomaly';
  else if (totalEP >= 1500) rarity = 'Epic';
  else if (totalEP >= 500) rarity = 'Rare';
  else if (totalEP >= 150) rarity = 'Uncommon';
  else if (totalEP >= 50) rarity = 'Common';
  
  return { badges, totalEP, rarity };
}
