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
  winRate: number;

  roleStats: {
    [role: string]: IRoleStat;
  };

  lastUpdated: Date;
}
