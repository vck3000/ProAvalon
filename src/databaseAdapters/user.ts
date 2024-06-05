import User from '../models/user';
import { IUser } from '../gameplay/types';
import { S3AvatarSet } from '../clients/s3/S3Agent';
import { getAvatarLibrarySizeForUser } from '../rewards/getRewards';

interface DatabaseAdapter {
  getUser(username: string): Promise<IUser>;
  setAvatarLinks(
    username: string,
    resLink: string,
    spyLink: string,
  ): Promise<void>;
  approveAvatar(
    username: string,
    avatarSet: S3AvatarSet,
    addToLibrary: boolean,
  ): Promise<void>;
}

class MongoUserAdapter implements DatabaseAdapter {
  async getUser(username: string): Promise<IUser> {
    return (await User.findOne({
      usernameLower: username.toLowerCase(),
    })) as IUser;
  }

  // Does not update the user's avatar Library. Only used by mods or in avatar resets
  async setAvatarLinks(username: string, resLink: string, spyLink: string) {
    const user = await this.getUser(username);

    user.avatarImgRes = resLink;
    user.avatarImgSpy = spyLink;

    await user.save();
  }

  async approveAvatar(
    username: string,
    avatarSet: S3AvatarSet,
    addToLibrary: boolean,
  ): Promise<void> {
    const user = await this.getUser(username);
    user.lastApprovedAvatarDate = new Date();

    if (addToLibrary) {
      user.avatarLibrary.push(avatarSet.avatarSetId);
      user.avatarImgRes = avatarSet.resLink;
      user.avatarImgSpy = avatarSet.spyLink;
    }

    await user.save();
  }
}

const userAdapter = new MongoUserAdapter();
export default userAdapter;
