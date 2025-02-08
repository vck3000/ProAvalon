import { Types } from 'mongoose';

export interface IRoleStat {
  gamesWon: number;
  gamesLost: number;
}

export interface IUserSeasonStat {
  id: string;
  userId: string;
  seasonId: string;

  rating: number;
  highestRating: number;
  ratingBracket: string;

  rankedGamesPlayed: number;
  rankedGamesWon: number;
  rankedGamesLost: number;
  winRate: number;

  roleStats: {
    [role: string]: IRoleStat;
  };

  lastUpdated: Date;

  // Mongoose methods
  save: () => Promise<this>;
  markModified: (path: string) => void;
}
