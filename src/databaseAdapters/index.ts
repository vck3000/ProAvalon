import { MongoUserAdapter } from './mongoose/user';
import IDatabaseAdapter from './databaseInterfaces';
import { MongoSeasonAdapter } from './mongoose/season';

class DatabaseAdapter implements IDatabaseAdapter {
  season = new MongoSeasonAdapter();
  user = new MongoUserAdapter();
}

const dbAdapter: DatabaseAdapter = new DatabaseAdapter();
export default dbAdapter;
