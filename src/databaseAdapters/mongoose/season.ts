import Season from '../../models/season';
import { ISeason } from '../../models/types/season';
import ISeasonDbAdapter from '../databaseInterfaces/season';
import { ISeasonRole } from '../../gameplay/roles/types';

// TODO-kev: Consider where to place this
export interface RatingBracket {
  name: string;
  min: number;
  max: number;
}

// TODO-kev: Ensure below is updated before release
export class MongoSeasonAdapter implements ISeasonDbAdapter {
  formatSeason(season: ISeason): string {
    const roles: string = season.rolesAvailable
      .map((role) => role.name)
      .join(', ');

    return `id=${season.id}; seasonNumber=${season.seasonCounter} name=${season.name}; startDate=${season.startDate}; endDate=${season.endDate}, gameMode=${season.gameMode}, roles=${roles}`;
  }

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
      seasonCounter: -1,
    });
    const seasonCounter = latestSeason ? latestSeason.seasonCounter + 1 : 0;

    const newSeason: ISeason = await Season.create({
      name: seasonName,
      seasonCounter,
      startDate,
      endDate,
      ratingBrackets,
      gameMode,
      rolesAvailable,
    });

    console.log(`Season created: ${this.formatSeason(newSeason)}`);

    return newSeason as ISeason;
  }
}
