import Season from '../models/season';
import { ISeason } from '../models/types/season.types';

interface DatabaseAdapter {
  getCurrentSeason(): Promise<ISeason | null>;
  createSeason(): Promise<ISeason | null>;
}

class MongoSeasonAdapter implements DatabaseAdapter {
  async getCurrentSeason(): Promise<ISeason | null> {
    const now = new Date();
    // TODO-kev: Maybe update this to find the one with the latest endDate?
    const currentSeason = await Season.findOne({
      startDate: { $lt: now },
      endDate: { $gt: now },
    });

    // TODO-kev: Consider how we want to handle nulls. Will there ever be a period where theres no active season? During resets?
    if (!currentSeason) {
      console.log(`ERROR: No current season found!!!`);
    }

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
