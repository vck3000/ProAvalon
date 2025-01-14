import Season from '../models/season';
import { ISeason } from '../models/types/season.types';

interface DatabaseAdapter {
  getCurrentSeason(): Promise<ISeason | null>;
  createSeason(seasonName: string): Promise<ISeason | null>;
}

class MongoSeasonAdapter implements DatabaseAdapter {
  async getCurrentSeason(): Promise<ISeason | null> {
    const currentSeason = await Season.findOne({
      isActive: true,
      endDate: { $gt: new Date() },
    });

    return currentSeason as ISeason;
  }

  async createSeason(seasonName: string): Promise<ISeason | null> {
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
}

const seasonAdapter = new MongoSeasonAdapter();
export default seasonAdapter;
