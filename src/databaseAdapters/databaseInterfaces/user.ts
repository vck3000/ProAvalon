import { Alliance, IUser } from '../../gameplay/gameEngine/types';
import { S3AvatarSet } from '../../clients/s3/S3Agent';
import { Role } from '../../gameplay/gameEngine/roles/types';

export default interface IUserDbAdapter {
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
  processGame(
    userId: string,
    timePlayed: Date,
    alliance: Alliance,
    role: Role,
    numPlayers: number,
    win: boolean,
    ranked: boolean,
    newRating?: number,
  ): Promise<void>;
}
