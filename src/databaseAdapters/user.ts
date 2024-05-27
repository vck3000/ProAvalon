import User from '../models/user';
import { IUser } from '../gameplay/types';

interface DatabaseAdapter {
  getUser(username: string): Promise<IUser>;
}

export class MongoUserAdapter implements DatabaseAdapter {
  async getUser(username: string): Promise<IUser> {
    return (await User.findOne({
      usernameLower: username.toLowerCase(),
    })) as IUser;
  }
}

const userAdapter = new MongoUserAdapter();
export default userAdapter;
