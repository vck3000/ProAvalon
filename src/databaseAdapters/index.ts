import { IUser } from '../gameplay/types';
import { MongoUserAdapter } from './user';
import { S3AvatarSet } from '../clients/s3/S3Agent';

interface DatabaseAdapter {
  user: {
    getUser(username: string): Promise<IUser>;
    setAvatarLinks(
      username: string,
      resLink: string,
      spyLink: string,
    ): Promise<void>;
    muteUser(userCallingMute: IUser, usernameToMute: string): Promise<void>;
    unmuteUser(
      userCallingUnmute: IUser,
      usernameToUnmute: string,
    ): Promise<void>;
    resetAvatar(username: string): Promise<void>;
    setAvatarAndUpdateLibrary(
      username: string,
      avatarSet: S3AvatarSet,
      librarySize: number,
    ): Promise<void>;
    removeAvatar(username: string, avatarSet: S3AvatarSet): Promise<void>;
  };
}

class MongoDatabaseAdapter implements DatabaseAdapter {
  user: MongoUserAdapter;

  constructor() {
    this.user = new MongoUserAdapter();
  }
}

const mongoDatabaseAdapter = new MongoDatabaseAdapter();

export const userAdapter = mongoDatabaseAdapter.user;
