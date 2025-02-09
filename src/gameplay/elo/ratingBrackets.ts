import { RatingBracket } from './types';

// Lists all historical rating bracket names
export enum RatingBracketName {
  IRON = 'iron',
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
  CHAMPION = 'champion',
}

export const DEFAULT_RATING_BRACKETS: RatingBracket[] = [
  { name: RatingBracketName.IRON, min: 0, max: 1299 }, // Lower limit set at 0
  { name: RatingBracketName.BRONZE, min: 1300, max: 1399 },
  { name: RatingBracketName.SILVER, min: 1400, max: 1549 },
  { name: RatingBracketName.GOLD, min: 1550, max: 1699 },
  { name: RatingBracketName.PLATINUM, min: 1700, max: 1799 },
  { name: RatingBracketName.DIAMOND, min: 1800, max: 1899 },
  { name: RatingBracketName.CHAMPION, min: 1900, max: Infinity }, // Must have no upper limit
];

export function getRatingBracket(
  rating: number,
  ratingBrackets: RatingBracket[],
): RatingBracketName {
  // Assumes there are no overlapping rating brackets
  for (const bracket of ratingBrackets) {
    if (rating >= bracket.min && rating <= bracket.max) {
      return bracket.name;
    }
  }

  throw new Error(`Could not assign rating ${rating} to a bracket.`);
}
