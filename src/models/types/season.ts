import { RatingBracketName } from '../../gameplay/elo/ratingBrackets';

export interface ISeason {
  id: string;
  index: number;
  name: string;
  startDate: Date;
  endDate: Date;

  ratingBrackets: {
    name: RatingBracketName;
    min: number;
    max: number;
  }[];
}
