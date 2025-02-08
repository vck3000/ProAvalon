import { IRoleStat, IUserSeasonStat } from '../../models/types/userSeasonStat';
import UserSeasonStat from '../../models/userSeasonStat';
import IUserSeasonStatDbAdapter from '../databaseInterfaces/userSeasonStat';
import Season from '../../models/season';
import { Role } from '../../gameplay/gameEngine/roles/types';

export class MongoUserSeasonStatAdapter implements IUserSeasonStatDbAdapter {
  async findOrCreate(
    userId: string,
    seasonId: string,
  ): Promise<IUserSeasonStat> {
    let stat: IUserSeasonStat = await UserSeasonStat.findOne({
      user: userId,
      season: seasonId,
    });

    if (!stat) {
      stat = await UserSeasonStat.create({
        user: userId,
        season: seasonId,
        roleStats: {},
      });

      console.log(`User season stat created: ${stringifyUserSeasonStat(stat)}`);
    }

    return stat;
  }

  async updateStat(
    userId: string,
    seasonId: string,
    isWin: boolean,
    ratingChange: number,
    role: Role,
  ): Promise<IUserSeasonStat> {
    const stat: IUserSeasonStat = await this.findOrCreate(userId, seasonId);

    // TODO-kev: Update below if it doesnt exist
    const roleStat: IRoleStat = stat.roleStats[role];

    stat.rankedGamesPlayed += 1;

    if (isWin) {
      stat.rankedGamesWon += 1;
      roleStat.gamesWon += 1;
    } else {
      stat.rankedGamesLost += 1;
      roleStat.gamesLost += 1;
    }

    stat.markModified('roleStats');

    stat.winRate = stat.rankedGamesWon / stat.rankedGamesPlayed;

    stat.rating += ratingChange;
    stat.ratingBracket = 'silver'; // TODO-kev: Update this part

    if (stat.rating > stat.highestRating) {
      stat.highestRating = stat.rating;
    }

    stat.lastUpdated = new Date();

    await stat.save();

    return stat;
  }
}

export function stringifyUserSeasonStat(stat: IUserSeasonStat) {
  const winRateFormatted = (stat.winRate * 100).toFixed(2) + '%';

  return `
      rating=${stat.rating},
      highestRating=${stat.highestRating}, 
      ratingBracket=${stat.ratingBracket},
      rankedGamesPlayed=${stat.rankedGamesPlayed}, 
      rankedGamesWon=${stat.rankedGamesWon}, 
      rankedGamesLost=${stat.rankedGamesLost}, 
      winRate=${winRateFormatted}, 
      lastUpdated=${stat.lastUpdated}, 
    `;
}
