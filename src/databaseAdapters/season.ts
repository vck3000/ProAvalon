import Season from '../models/season';
import { ISeason } from '../models/types/season.types';

interface DatabaseAdapter {
  getCurrentSeason(): Promise<ISeason | null>;
  createSeason(seasonName: string): Promise<ISeason>;
  resetSeason(newSeasonName: string): Promise<void>;
}

class MongoSeasonAdapter implements DatabaseAdapter {
  async getCurrentSeason(): Promise<ISeason | null> {
    const currentSeason: ISeason | null = await Season.findOne({
      isActive: true,
    });

    return currentSeason as ISeason;
  }

  async createSeason(seasonName: string): Promise<ISeason> {
    const currentSeason: ISeason = await this.getCurrentSeason();

    if (currentSeason) {
      throw new Error('Unable to create season as an active one exists.');
    }

    // TODO-kev: This is just an example of creating a season. Consider configurable params etc
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 3); // 3 months

    const newSeason: ISeason = await Season.create({
      name: seasonName,
      startDate: startDate,
      endDate: endDate,
      isActive: true,
    });

    console.log(
      `Season created: id= ${newSeason._id}; name=${newSeason.name}; startDate=${newSeason.startDate}; endDate=${newSeason.endDate}`,
    );

    return newSeason as ISeason;
  }

  async resetSeason(newSeasonName: string): Promise<void> {
    const currentSeason: ISeason | null = await this.getCurrentSeason();

    if (currentSeason) {
      // Check if ongoing season
      if (currentSeason.endDate > new Date()) {
        throw new Error(
          `Unable to reset season while season is ongoing. Current season ends on ${currentSeason.endDate}.`,
        );
      }

      // Deactivate the current season
      currentSeason.isActive = false;
      await currentSeason.save();
      console.log(
        `Deactivated season: id=${currentSeason._id}; name=${currentSeason.name}`,
      );
    }

    // Create a new season
    await this.createSeason(newSeasonName);
  }
}

const seasonAdapter = new MongoSeasonAdapter();
export default seasonAdapter;
