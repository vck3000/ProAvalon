import User from '../models/user';
import { IUser } from '../gameplay/types';

interface DatabaseAdapter {
  getUser(username: string): Promise<IUser>;
  updateAvatar(user: IUser, resLink: string, spyLink: string): Promise<void>;
}

class MongoUserAdapter implements DatabaseAdapter {
  async getUser(username: string): Promise<IUser> {
    return (await User.findOne({
      usernameLower: username.toLowerCase(),
    })) as IUser;
  }

  async updateAvatar(user: IUser, resLink: string, spyLink: string) {
    user.avatarImgRes = resLink;
    user.avatarImgSpy = spyLink;
    await user.save();
  }
}

const userAdapter = new MongoUserAdapter();
export default userAdapter;
