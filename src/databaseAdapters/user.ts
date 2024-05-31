import User from '../models/user';
import { IUser } from '../gameplay/types';
import { InvalidLinkError, S3Agent } from '../clients/s3/S3Agent';
import S3Controller from '../clients/s3/S3Controller';

export class UserNotFoundError extends Error {
  constructor(username: string) {
    super(`Invalid username. Could not find: ${username}`);
  }
}

interface DatabaseAdapter {
  getUser(username: string): Promise<IUser>;
  updateAvatar(
    username: string,
    resLink: string,
    spyLink: string,
  ): Promise<void>;
}

const s3Agent = new S3Agent(new S3Controller());

class MongoUserAdapter implements DatabaseAdapter {
  async getUser(username: string): Promise<IUser> {
    return (await User.findOne({
      usernameLower: username.toLowerCase(),
    })) as IUser;
  }

  async updateAvatar(username: string, resLink: string, spyLink: string) {
    const usernameLower = username.toLowerCase();

    const user = await this.getUser(usernameLower);
    if (!user) {
      throw new UserNotFoundError(username);
    }

    if (
      !s3Agent.isValidLink(resLink, 'res') ||
      !s3Agent.isValidLink(spyLink, 'spy')
    ) {
      throw new InvalidLinkError();
    }

    user.avatarImgRes = resLink;
    user.avatarImgSpy = spyLink;
    await user.save();
  }
}

const userAdapter = new MongoUserAdapter();
export default userAdapter;
