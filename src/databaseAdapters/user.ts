import User from '../models/user';
import { IUser } from '../gameplay/types';
import { S3AvatarSet } from '../clients/s3/S3Agent';

interface DatabaseAdapter {
  getUser(username: string): Promise<IUser>;
  setAvatarLinks(
    username: string,
    resLink: string,
    spyLink: string,
  ): Promise<void>;
  muteUser(userCallingMute: IUser, usernameToMute: string): Promise<void>;
  unmuteUser(userCallingUnmute: IUser, usernameToUnmute: string): Promise<void>;
  resetAvatar(username: string): Promise<void>;
  setAvatarAndUpdateLibrary(
    username: string,
    avatarSet: S3AvatarSet,
    librarySize: number,
  ): Promise<void>;
  removeAvatar(username: string, avatarSet: S3AvatarSet): Promise<void>;
}

class MongoUserAdapter implements DatabaseAdapter {
  async getUser(username: string): Promise<IUser> {
    return (await User.findOne({
      usernameLower: username.toLowerCase(),
    })) as IUser;
  }

  async muteUser(userCallingMute: IUser, usernameToMute: string) {
    if (!userCallingMute.mutedPlayers) {
      userCallingMute.mutedPlayers = [];
    }

    userCallingMute.mutedPlayers.push(usernameToMute.toLowerCase());
    userCallingMute.markModified('mutedPlayers');
    await userCallingMute.save();
  }

  async unmuteUser(userCallingUnmute: IUser, usernameToUnmute: string) {
    userCallingUnmute.mutedPlayers = userCallingUnmute.mutedPlayers.filter(
      (unmuteUsername) => unmuteUsername !== usernameToUnmute.toLowerCase(),
    );

    userCallingUnmute.markModified('mutedPlayers');
    await userCallingUnmute.save();
  }

  // Does not update the user's avatar Library. Only used by mods or in avatar resets
  async setAvatarLinks(username: string, resLink: string, spyLink: string) {
    const user = await this.getUser(username);

    user.avatarImgRes = resLink;
    user.avatarImgSpy = spyLink;

    await user.save();
  }

  async resetAvatar(username: string) {
    await this.setAvatarLinks(username, null, null);
  }

  async setAvatarAndUpdateLibrary(
    username: string,
    avatarSet: S3AvatarSet,
    librarySize: number,
  ): Promise<void> {
    const user = await this.getUser(username);

    user.lastApprovedAvatarDate = new Date();
    user.avatarImgRes = avatarSet.resLink;
    user.avatarImgSpy = avatarSet.spyLink;
    user.avatarLibrary.push(avatarSet.avatarSetId);

    while (user.avatarLibrary.length > librarySize) {
      user.avatarLibrary.shift();
    }

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
