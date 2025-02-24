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
    const gameSizeKey = `${numPlayers}p`;
    const lowercaseRole = role.toLowerCase();

    user.totalTimePlayed = new Date(
      totalTimePlayed.getTime() + timePlayed.getTime(),
    );

    user.totalGamesPlayed += 1;
    if (ranked) {
      user.totalRankedGamesPlayed += 1;
    }

    // Initialise roleStats object if not present
    if (!user.roleStats[gameSizeKey]) {
      user.roleStats[gameSizeKey] = {};
    }

    if (!user.roleStats[gameSizeKey][lowercaseRole]) {
      user.roleStats[gameSizeKey][lowercaseRole] = {
        wins: 0,
        losses: 0,
      };
    }

    // TODO-kev: Is this check even required?
    if (isNaN(user.roleStats[gameSizeKey][lowercaseRole].wins)) {
      user.roleStats[gameSizeKey][lowercaseRole].wins = 0;
    }

    if (isNaN(user.roleStats[gameSizeKey][lowercaseRole].losses)) {
      user.roleStats[gameSizeKey][lowercaseRole].losses = 0;
    }

    // Initialise winsLossesGameSizeBreakdown object if not present
    if (!user.winsLossesGameSizeBreakdown[gameSizeKey]) {
      user.winsLossesGameSizeBreakdown[gameSizeKey] = {
        wins: 0,
        losses: 0,
      };
    } else {
      // TODO-kev: Is this check even required?
      if (isNaN(user.winsLossesGameSizeBreakdown[gameSizeKey].wins)) {
        user.winsLossesGameSizeBreakdown[gameSizeKey].wins = 0;
      }

      if (isNaN(user.winsLossesGameSizeBreakdown[gameSizeKey].losses)) {
        user.winsLossesGameSizeBreakdown[gameSizeKey].losses = 0;
      }
    }

    if (win) {
      user.totalWins += 1;
      user.roleStats[gameSizeKey][lowercaseRole].wins += 1;
      user.winsLossesGameSizeBreakdown[gameSizeKey].wins += 1;
    } else {
      user.totalLosses += 1;
      user.roleStats[gameSizeKey][lowercaseRole].losses += 1;
      user.winsLossesGameSizeBreakdown[gameSizeKey].losses += 1;
    }

    if (alliance === Alliance.Resistance) {
      win ? user.totalResWins++ : user.totalResLosses++;
    }

    user.markModified('roleStats');
    user.markModified('winsLossesGameSizeBreakdown');

    await user.save();
  }
}
