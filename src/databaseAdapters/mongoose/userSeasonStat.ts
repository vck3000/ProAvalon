import { IRoleStat, IUserSeasonStat } from '../../models/types/userSeasonStat';
import { Types } from 'mongoose';
import UserSeasonStat from '../../models/userSeasonStat';
import IUserSeasonStatDbAdapter from '../databaseInterfaces/userSeasonStat';
import Season from '../../models/season';
import { Role } from '../../gameplay/roles/types';

export class MongoUserSeasonStatAdapter implements IUserSeasonStatDbAdapter {
  formatUserSeasonStat(stat: IUserSeasonStat): string {
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

  async createStat(
    userId: Types.ObjectId,
    seasonId: Types.ObjectId,
  ): Promise<IUserSeasonStat> {
    // TODO-kev: Consider how to add this. Should we be using the seasonAdapter within here?
    const season = await Season.findById(seasonId).select('rolesAvailable');

    if (!season) {
      throw new Error(`Season does not exist: seasonId=${seasonId}`);
    }

    const roleStats: { [key: string]: IRoleStat } = {};

    for (const role of season.rolesAvailable) {
      roleStats[role.name] = {
        gamesWon: 0,
        gamesLost: 0,
      };
    }

    return await UserSeasonStat.create({
      user: userId,
      season: seasonId,
      roleStats,
    });
  }

  async getStat(
    userId: Types.ObjectId,
    seasonId: Types.ObjectId,
  ): Promise<IUserSeasonStat> {
    const stat: IUserSeasonStat = await UserSeasonStat.findOne({
      user: userId,
      season: seasonId,
    });

    return stat ? stat : await this.createStat(userId, seasonId);
  }

  async updateStat(
    userId: Types.ObjectId,
    seasonId: Types.ObjectId,
    isWin: boolean,
    ratingChange: number,
    role: Role,
  ): Promise<IUserSeasonStat> {
    const stat: IUserSeasonStat = await this.getStat(userId, seasonId);
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
