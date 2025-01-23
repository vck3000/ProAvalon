import { ISeasonalStat } from '../../models/types/seasonalStats';
import { Types } from 'mongoose';
import SeasonalStats from '../../models/seasonalStats';

export class MongoSeasonalStatAdapter {
  // TODO-kev: Delete below after usage
  parseSeasonalStat(stat: ISeasonalStat): string {
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
  ): Promise<ISeasonalStat> {
    return await SeasonalStats.create({
      user: userId,
      season: seasonId,
    });
  }

  async getStat(
    userId: Types.ObjectId,
    seasonId: Types.ObjectId,
  ): Promise<ISeasonalStat> {
    const stat: ISeasonalStat = await SeasonalStats.findOne({
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
  ): Promise<ISeasonalStat> {
    const stat: ISeasonalStat = await SeasonalStats.findOne({
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
