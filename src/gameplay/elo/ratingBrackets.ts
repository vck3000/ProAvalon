import { RatingBracket } from './types';

export const RATING_BRACKETS: RatingBracket[] = [
  { name: 'iron', min: 0, max: 1299 }, // Lower limit set at 0
  { name: 'bronze', min: 1300, max: 1399 },
  { name: 'silver', min: 1400, max: 1549 },
  { name: 'gold', min: 1550, max: 1699 },
  { name: 'platinum', min: 1700, max: 1799 },
  { name: 'diamond', min: 1800, max: 1899 },
  { name: 'champion', min: 1900, max: Infinity }, // Must have no upper limit
];
