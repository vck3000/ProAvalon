import { MongoUserAdapter } from './user';
import IDatabaseAdapter from '../databaseInterfaces';
import { MongoSeasonAdapter } from './season';

class MongoDatabaseAdapter implements IDatabaseAdapter {
  season: MongoSeasonAdapter = new MongoSeasonAdapter();
  user: MongoUserAdapter = new MongoUserAdapter();
}

const mongoDbAdapter: MongoDatabaseAdapter = new MongoDatabaseAdapter();
export default mongoDbAdapter;
