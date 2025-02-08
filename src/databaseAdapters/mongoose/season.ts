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
    const currentSeason = await this.getCurrentSeason();

    if (currentSeason) {
      throw new Error('Unable to create season as an active one exists.');
    }

    const latestSeason = await Season.findOne().sort({
      index: -1,
    });
    const index = latestSeason ? latestSeason.index + 1 : 0;

    const newSeason = await Season.create({
      name: seasonName,
      index,
      startDate,
      endDate,
      ratingBrackets,
    });

    console.log(`Season created: ${newSeason.stringifySeason()}`);

    return newSeason as ISeason;
  }
}
