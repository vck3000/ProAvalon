import User from '../models/user';
import { IUser } from '../gameplay/types';

interface DatabaseAdapter {
  getUser(username: string): Promise<IUser>;
  updateAvatar(
    username: string,
    resLink: string,
    spyLink: string,
  ): Promise<void>;
}

class MongoUserAdapter implements DatabaseAdapter {
  async getUser(username: string): Promise<IUser> {
    return (await User.findOne({
      usernameLower: username.toLowerCase(),
    })) as IUser;
  }

  async updateAvatar(username: string, resLink: string, spyLink: string) {
    const user = await this.getUser(username);

    user.avatarImgRes = resLink;
    user.avatarImgSpy = spyLink;
    await user.save();
  }
}

const userAdapter = new MongoUserAdapter();
export default userAdapter;
