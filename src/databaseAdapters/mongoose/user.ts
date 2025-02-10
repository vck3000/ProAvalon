import { S3AvatarSet } from '../../clients/s3/S3Agent';
import IUserDbAdapter from '../databaseInterfaces/user';
import { IUser } from '../../gameplay/gameEngine/types';
import User from '../../models/user';

export class MongoUserAdapter implements IUserDbAdapter {
  async getUser(username: string): Promise<IUser> {
    return (await User.findOne({
      usernameLower: username.toLowerCase(),
    })) as IUser;
  }

  async getUserById(id: string): Promise<IUser> {
    return (await User.findById(id)) as IUser;
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
