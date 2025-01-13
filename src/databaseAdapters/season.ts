import Season from '../models/season';
import { ISeason } from '../models/types/season.types';

interface DatabaseAdapter {
  getCurrentSeason(): Promise<ISeason>;
}

class MongoSeasonAdapter implements DatabaseAdapter {
  async getCurrentSeason(): Promise<ISeason | null> {
    const now = new Date();
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

  async createSeason(): Promise<void> {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1);

    const dummySeason = new Season({
      name: 'Test 1',
      description: 'First test',
      startDate: startDate,
      endDate: endDate,
    });

    await Season.create(dummySeason);

    console.log('Season created successfully');
  }
}

const seasonAdapter = new MongoSeasonAdapter();
export default seasonAdapter;
