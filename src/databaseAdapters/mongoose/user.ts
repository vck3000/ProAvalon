import { S3AvatarSet } from '../../clients/s3/S3Agent';
import IUserDbAdapter from '../databaseInterfaces/user';
import { Alliance, IUser } from '../../gameplay/gameEngine/types';
import User from '../../models/user';
import { Role } from '../../gameplay/gameEngine/roles/types';

export class MongoUserAdapter implements IUserDbAdapter {
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

  async updateRating(userId: string, newRating: number): Promise<void> {
    if (newRating < 0) {
      throw new Error(`Invalid rating received: ${newRating}`);
    }

    const user = await User.findById(userId);
    user.playerRating = newRating;

    await user.save();
  }

  async processGame(
    userId: string,
    timePlayed: Date,
    alliance: Alliance,
    role: Role,
    numPlayers: number,
    win: boolean,
    ranked: boolean,
  ): Promise<void> {
    const user = await User.findById(userId);
    const totalTimePlayed = user.totalTimePlayed as Date;

    user.totalTimePlayed = new Date(
      totalTimePlayed.getTime() + timePlayed.getTime(),
    );
    user.totalGamesPlayed += 1;

    if (ranked) {
      user.totalRankedGamesPlayed += 1;
    }

    // Initialise roleStats object if not present
    if (!user.roleStats[`${numPlayers}p`]) {
      user.roleStats[`${numPlayers}p`] = {};
    }

    if (!user.roleStats[`${numPlayers}p`][role]) {
      user.roleStats[`${numPlayers}p`][role] = {
        wins: 0,
        losses: 0,
      };
    }

    if (isNaN(user.roleStats[`${numPlayers}p`][role].wins)) {
      user.roleStats[`${numPlayers}p`][role].wins = 0;
    }

    if (isNaN(user.roleStats[`${numPlayers}p`][role].losses)) {
      user.roleStats[`${numPlayers}p`][role].losses = 0;
    }

    // Initialise winsLossesGameSizeBreakdown object if not present
    if (!user.winsLossesGameSizeBreakdown[`${numPlayers}p`]) {
      user.winsLossesGameSizeBreakdown[`${numPlayers}p`] = {
        wins: 0,
        losses: 0,
      };
    } else {
      if (isNaN(user.winsLossesGameSizeBreakdown[`${numPlayers}p`].wins)) {
        user.winsLossesGameSizeBreakdown[`${numPlayers}p`].wins = 0;
      }

      if (isNaN(user.winsLossesGameSizeBreakdown[`${numPlayers}p`].losses)) {
        user.winsLossesGameSizeBreakdown[`${numPlayers}p`].losses = 0;
      }
    }

    if (win) {
      user.totalWins += 1;
      if (alliance === Alliance.Resistance) {
        user.totalResWins += 1;
      }

      user.roleStats[`${numPlayers}p`][role].wins += 1;
      user.winsLossesGameSizeBreakdown[`${numPlayers}p`].wins += 1;
    } else {
      user.totalLosses += 1;
      if (alliance === Alliance.Resistance) {
        user.totalResLosses += 1;
      }

      user.roleStats[`${numPlayers}p`][role].losses += 1;
      user.winsLossesGameSizeBreakdown[`${numPlayers}p`].losses += 1;
    }

    user.markModified('roleStats');
    user.markModified('winsLossesGameSizeBreakdown');

    await user.save();
  }
}
