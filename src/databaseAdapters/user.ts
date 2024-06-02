import User from '../models/user';
import { IUser } from '../gameplay/types';
import { S3AvatarSet } from '../clients/s3/S3Agent';

interface DatabaseAdapter {
  getUser(username: string): Promise<IUser>;
  updateAvatar(
    username: string,
    resLink: string,
    spyLink: string,
  ): Promise<void>;
  removeAvatar(username: string, avatarSet: S3AvatarSet): Promise<void>;
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

  async removeAvatar(username: string, avatarSet: S3AvatarSet) {
    const user = await this.getUser(username);
    user.avatarLibrary = user.avatarLibrary.filter(
      (id) => id !== avatarSet.avatarSetId,
    );

    if (user.avatarImgRes === avatarSet.resLink) {
      user.avatarImgRes = null;
    }
    if (user.avatarImgSpy === avatarSet.spyLink) {
      user.avatarImgSpy = null;
    }

    await user.save();
  }
}

const userAdapter = new MongoUserAdapter();
export default userAdapter;
