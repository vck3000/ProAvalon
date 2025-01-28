import { IUserSeasonStat } from '../../models/types/userSeasonStat';
import { Types } from 'mongoose';
import UserSeasonStat from '../../models/userSeasonStat';
import IUserSeasonStatDbAdapter from '../databaseInterfaces/userSeasonStat';

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
    return await UserSeasonStat.create({
      user: userId,
      season: seasonId,
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
  ): Promise<IUserSeasonStat> {
    const stat: IUserSeasonStat = await UserSeasonStat.findOne({
      user: userId,
      season: seasonId,
    });

    stat.rankedGamesPlayed += 1;

    if (isWin) {
      stat.rankedGamesWon += 1;
    } else {
      stat.rankedGamesLost += 1;
    }

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
