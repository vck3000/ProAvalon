import { MongoUserAdapter } from './user';
import IDatabaseAdapter from '../databaseInterfaces';

class MongoDatabaseAdapter implements IDatabaseAdapter {
  user: MongoUserAdapter = new MongoUserAdapter();
}

const mongoDatabaseAdapter = new MongoDatabaseAdapter();

export const userAdapter = mongoDatabaseAdapter.user;
