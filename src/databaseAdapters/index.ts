import { MongoUserAdapter } from './mongoose/user';
import IDatabaseAdapter from './databaseInterfaces';
import { MongoSeasonAdapter } from './mongoose/season';
import { MongoUserSeasonStatAdapter } from "./mongoose/userSeasonStat";
import { MongoSiteRoleAdapter } from './mongoose/siteRole';

class DatabaseAdapter implements IDatabaseAdapter {
  season = new MongoSeasonAdapter();
  user = new MongoUserAdapter();
  userSeasonStat = new MongoUserSeasonStatAdapter();
  siteRole = new MongoSiteRoleAdapter(); 
}

const dbAdapter: DatabaseAdapter = new DatabaseAdapter();
export default dbAdapter;
