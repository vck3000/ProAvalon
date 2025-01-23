import IDatabaseAdapter from '../databaseInterfaces';
import { MongoSeasonAdapter } from './season';
import { MongoSeasonalStatAdapter } from './seasonalStat';
import { MongoUserAdapter } from './user';

class MongoDatabaseAdapter implements IDatabaseAdapter {
  season: MongoSeasonAdapter = new MongoSeasonAdapter();
  seasonalStat: MongoSeasonalStatAdapter = new MongoSeasonalStatAdapter();
  user: MongoUserAdapter = new MongoUserAdapter();
}

const mongoDbAdapter: MongoDatabaseAdapter = new MongoDatabaseAdapter();
export default mongoDbAdapter;
