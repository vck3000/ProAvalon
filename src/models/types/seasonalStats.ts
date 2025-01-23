import { Types } from 'mongoose';

export interface ISeasonalStat {
  id: Types.ObjectId;
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

  // Mongoose methods
  save: () => Promise<this>;
}
