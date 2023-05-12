import { DatabaseInterface } from './interface';
import User from '../models/user';

export class MongoInterface implements DatabaseInterface {
  static GetUserByUsername(username: string): Promise<typeof User> {
    // @ts-ignore
    return User.findOne({ usernameLower: username.toLowerCase() });
  }

  // GetUserById: (id: number) => typeof User;
}
