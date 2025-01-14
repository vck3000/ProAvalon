import Season from '../models/season';
import { ISeason } from '../models/types/season.types';

interface DatabaseAdapter {
  getCurrentSeason(): Promise<ISeason | null>;
  createSeason(): Promise<ISeason | null>;
}

class MongoSeasonAdapter implements DatabaseAdapter {
  async getCurrentSeason(): Promise<ISeason | null> {
    const currentSeason = await Season.findOne({
      isActive: true,
      endDate: { $gt: new Date() },
    });

    return currentSeason as ISeason;
  }

  async createSeason(): Promise<ISeason | null> {
    // TODO-kev: This is just an example of creating a season. Consider configurable params etc
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1);

    const dummySeason = new Season({
      name: 'Test 1',
      description: 'First test',
      startDate: startDate,
      endDate: endDate,
    });

    const newSeason = await Season.create(dummySeason);
    console.log('Season created successfully');

    return newSeason as ISeason;
  }
}

const seasonAdapter = new MongoSeasonAdapter();
export default seasonAdapter;
