import { Document, Types } from 'mongoose';

export interface ISeasonalStat extends Document {
  user: Types.ObjectId;
  season: Types.ObjectId;

  rating: number;
  highestRating: number;
  ratingBracket: string;

  rankedGamesPlayed: number;
  rankedGamesWon: number;
  rankedGamesLost: number;
  winRate: number;

  lastUpdated: Date;
}
