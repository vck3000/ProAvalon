import { RatingBracket } from '../types';
import { getRatingBracket, RatingBracketName } from '../ratingBrackets';

// Assumes no overlapping rating brackets
const TEST_RATING_BRACKETS: RatingBracket[] = [
  { name: RatingBracketName.IRON, min: 0, max: 1299 }, // Lower limit set at 0
  { name: RatingBracketName.BRONZE, min: 1300, max: 1399 },
  { name: RatingBracketName.SILVER, min: 1400, max: 1549 },
  { name: RatingBracketName.GOLD, min: 1550, max: 1699 },
  { name: RatingBracketName.PLATINUM, min: 1700, max: 1799 },
  { name: RatingBracketName.DIAMOND, min: 1800, max: 1899 },
  { name: RatingBracketName.CHAMPION, min: 1900, max: Infinity }, // Must have no upper limit
];

describe('getRatingBracket', () => {
  it(`should return the correct rating bracket for valid ratings.`, () => {
    expect(getRatingBracket(1000, TEST_RATING_BRACKETS)).toBe(
      RatingBracketName.IRON,
    );
    expect(getRatingBracket(1500, TEST_RATING_BRACKETS)).toBe(
      RatingBracketName.SILVER,
    );
  });

  it(`should return the correct rating bracket for boundary values.`, () => {
    expect(getRatingBracket(0, TEST_RATING_BRACKETS)).toBe(
      RatingBracketName.IRON,
    );
    expect(getRatingBracket(1550, TEST_RATING_BRACKETS)).toBe(
      RatingBracketName.GOLD,
    );
    expect(getRatingBracket(1699, TEST_RATING_BRACKETS)).toBe(
      RatingBracketName.GOLD,
    );
    expect(getRatingBracket(99999, TEST_RATING_BRACKETS)).toBe(
      RatingBracketName.CHAMPION,
    );
  });

  it(`should throw an error if invalid ratings are received.`, () => {
    expect(() => getRatingBracket(-100, TEST_RATING_BRACKETS)).toThrow(
      `Rating must be greater than or equal to 0: -100`,
    );

    const invalidRatingBrackets: RatingBracket[] = [
      { name: RatingBracketName.IRON, min: 100, max: 1299 },
      { name: RatingBracketName.BRONZE, min: 1300, max: 1399 },
    ];

    expect(() => getRatingBracket(5, invalidRatingBrackets)).toThrow(
      `Could not assign rating 5 to a bracket.`,
    );
    expect(() => getRatingBracket(1500, invalidRatingBrackets)).toThrow(
      `Could not assign rating 1500 to a bracket.`,
    );
  });
});
