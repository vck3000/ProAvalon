import { MongoUserAdapter } from './mongoose/user';
import IDatabaseAdapter from './databaseInterfaces';
import { MongoSeasonAdapter } from './mongoose/season';
import { MongoUserSeasonStatAdapter } from "./mongoose/userSeasonStat";

class DatabaseAdapter implements IDatabaseAdapter {
  season = new MongoSeasonAdapter();
  user = new MongoUserAdapter();
  userSeasonStat = new MongoUserSeasonStatAdapter();
}

const dbAdapter: DatabaseAdapter = new DatabaseAdapter();
export default dbAdapter;
