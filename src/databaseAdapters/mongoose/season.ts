import Season from '../../models/season';
import { ISeason } from '../../models/types/season';
import ISeasonDbAdapter from '../databaseInterfaces/season';
import { RatingBracket } from '../../gameplay/elo/types';

export class MongoSeasonAdapter implements ISeasonDbAdapter {
  async getCurrentSeason(): Promise<ISeason | null> {
    const currentSeason: ISeason | null = await Season.findOne({
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    return currentSeason as ISeason;
  }

  async createSeason(
    seasonName: string,
    startDate: Date,
    endDate: Date,
    ratingBrackets: RatingBracket[],
  ): Promise<ISeason> {
    if (startDate > endDate) {
      throw new Error(`Season start date must be before its end date`);
    }

    const latestSeason = await Season.findOne().sort({
      index: -1,
    });

    if (latestSeason && startDate <= latestSeason.endDate) {
      throw new Error(
        `Unable to create season: Start date must be after ${latestSeason.endDate}`,
      );
    }

    const newSeason = await Season.create({
      name: seasonName,
      index: latestSeason ? latestSeason.index + 1 : 0,
      startDate,
      endDate,
      ratingBrackets,
    });

    console.log(`Season created: ${newSeason.stringifySeason()}`);

    return newSeason as ISeason;
  }
}
