import Season from '../../models/season';
import { ISeason } from '../../models/types/season';
import ISeasonDbAdapter from '../databaseInterfaces/season';
import { ISeasonRole } from '../../gameplay/roles/types';
import { RatingBracket } from '../../gameplay/elo/types';

// TODO-kev: Ensure below is updated before release
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
    gameMode: string,
    rolesAvailable: ISeasonRole[],
  ): Promise<ISeason> {
    const currentSeason: ISeason = await this.getCurrentSeason();

    if (currentSeason) {
      throw new Error('Unable to create season as an active one exists.');
    }

    // TODO-kev: This is just an example of creating a season. Consider configurable params etc
    const latestSeason: ISeason | null = await Season.findOne().sort({
      index: -1,
    });
    const index = latestSeason ? latestSeason.index + 1 : 0;

    const newSeason: ISeason = await Season.create({
      name: seasonName,
      index,
      startDate,
      endDate,
      ratingBrackets,
      gameMode,
      rolesAvailable,
    });

    console.log(`Season created: ${newSeason.stringifySeason()}`);

    return newSeason as ISeason;
  }
}
