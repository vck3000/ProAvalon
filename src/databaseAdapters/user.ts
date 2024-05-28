import User from '../models/user';
import { IUser } from '../gameplay/types';

export class UserNotFoundError extends Error {
  constructor(username: string) {
    super(`Invalid username. Could not find: ${username}`);
  }
}

interface DatabaseAdapter {
  getUser(username: string): Promise<IUser>;
  updateAvatar(username: string, resLink: string, spyLink: string): void;
}

class MongoUserAdapter implements DatabaseAdapter {
  async getUser(username: string): Promise<IUser> {
    return (await User.findOne({
      usernameLower: username.toLowerCase(),
    })) as IUser;
  }

  async updateAvatar(username: string, resLink: string, spyLink: string) {
    const user = await this.getUser(username);

    if (!user) {
      throw new UserNotFoundError(username);
    }

    user.avatarImgRes = resLink;
    user.avatarImgSpy = spyLink;
    await user.save();
  }
}

const userAdapter = new MongoUserAdapter();
export default userAdapter;
