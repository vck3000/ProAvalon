import Season from '../../models/season';
import { ISeason } from '../../models/types/season.types';

// TODO-kev: Should we have the implement interface here or no need?
export class MongoSeasonAdapter {
  parseSeason(season: ISeason): string {
    return `id= ${season.id}; 
    seasonNumber=${season.seasonCounter}
    name= ${season.name}; 
    startDate= ${season.startDate}; 
    endDate= ${season.endDate}`;
  }

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

      ratingBrackets: [
        { name: 'iron', min: 0, max: 1299 }, // Lower limit set at 0
        { name: 'bronze', min: 1300, max: 1399 },
        { name: 'silver', min: 1400, max: 1549 },
        { name: 'gold', min: 1550, max: 1699 },
        { name: 'platinum', min: 1700, max: 1799 },
        { name: 'diamond', min: 1800, max: 1899 },
        { name: 'champion', min: 1900, max: Infinity }, // Must have no upper limit
      ],
    });

    console.log(`Season created: ${this.parseSeason(newSeason)}`);

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
        `Deactivated season: id=${currentSeason.id}; name=${currentSeason.name}`,
      );
    }

    // Create a new season
    await this.createSeason(newSeasonName);
  }
}
