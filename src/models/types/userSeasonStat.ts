import { Types } from 'mongoose';

export interface IUserSeasonStat {
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

  roleStats: {
    role: string;
    gamesWon: number;
    gamesLost: number;
  }[];

  lastUpdated: Date;

  // Mongoose methods
  save: () => Promise<this>;
}
