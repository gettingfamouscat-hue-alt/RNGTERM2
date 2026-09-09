// Client-safe badge detector presets (NO Prisma import)
export const SAFE_DETECTOR_PRESETS = [
  { type: 'exact', label: 'Exact Number', example: '777', description: 'Roll must equal this exact number' },
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
