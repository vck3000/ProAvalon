import IDatabaseAdapter from '../databaseInterfaces';
import { MongoSeasonAdapter } from './season';
import { MongoUserSeasonStatAdapter } from './userSeasonStat';
import { MongoUserAdapter } from './user';

class MongoDatabaseAdapter implements IDatabaseAdapter {
  season: MongoSeasonAdapter = new MongoSeasonAdapter();
  user: MongoUserAdapter = new MongoUserAdapter();
  userSeasonStat: MongoUserSeasonStatAdapter = new MongoUserSeasonStatAdapter();
}

const mongoDbAdapter: MongoDatabaseAdapter = new MongoDatabaseAdapter();
export default mongoDbAdapter;
