import { RatingBracketName } from './ratingBrackets';

export interface RatingBracket {
  name: RatingBracketName;
  min: number; // Inclusive
  max: number; // Inclusive
}
