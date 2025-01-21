import { MongoUserAdapter } from './user';
import IDatabaseAdapter from '../databaseInterfaces';
import { MongoSeasonAdapter } from './season';

class MongoDatabaseAdapter implements IDatabaseAdapter {
  season: MongoSeasonAdapter = new MongoSeasonAdapter();
  user: MongoUserAdapter = new MongoUserAdapter();
}

const mongoDatabaseAdapter: MongoDatabaseAdapter = new MongoDatabaseAdapter();

export const seasonAdapter: MongoSeasonAdapter = mongoDatabaseAdapter.season;
export const userAdapter: MongoUserAdapter = mongoDatabaseAdapter.user;
