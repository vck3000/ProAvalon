export interface IRoleStatsMap {
  [role: string]: IRoleStat;
}

export interface IRoleStat {
  gamesPlayed: number;
  gamesWon: number;
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
    [playerCount: string]: IRoleStatsMap;
  };

  lastUpdated: Date;
}
