import { MongoUserAdapter } from './mongoose/user';
import IDatabaseAdapter from './databaseInterfaces';
import { MongoSeasonAdapter } from './mongoose/season';

class DatabaseAdapter implements IDatabaseAdapter {
  // TODO-kev: Would you leave the typing here?
  season: MongoSeasonAdapter = new MongoSeasonAdapter();
  user: MongoUserAdapter = new MongoUserAdapter();
}

const dbAdapter: DatabaseAdapter = new DatabaseAdapter();
export default dbAdapter;
