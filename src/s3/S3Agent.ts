import { Buffer } from 'buffer';
import { S3Controller } from './S3Controller';

enum FolderName {
  APPROVE = 'approved_avatars',
  PENDING = 'pending_avatars',
}

class S3Agent {
  private s3Controller: S3Controller;

  constructor() {
    this.s3Controller = new S3Controller(process.env.ENV);
  }

  // =====================================================
  // CUSTOM AVATAR FUNCTIONS
  // =====================================================

  // Uploads avatar requests to s3. Presumes validation checks have been completed
  // Returns accessible links for res and spy avatars
  // Note to add a new prefix for all files to be checked
  public async uploadAvatarRequestImages(
    username: string,
    resAvatar: Buffer,
    spyAvatar: Buffer,
  ) {
    const usernameLower = username.toLowerCase();
    const prefix1 = `${FolderName.PENDING}/${usernameLower}/`;
    const prefix2 = `${FolderName.APPROVE}/${usernameLower}/`;

    // Find unique ID for filepath generation
    const existingObjectKeys = await this.s3Controller.listObjectKeys([
      prefix1,
      prefix2,
    ]);
    const counter = this.getCurrentKeyCounter(existingObjectKeys);

    const resFileName = `${usernameLower}_res_${counter + 1}.png`;
    const spyFileName = `${usernameLower}_spy_${counter + 1}.png`;

    const resKey = `${prefix1}${resFileName}`;
    const spyKey = `${prefix1}${spyFileName}`;

    const succeededFiles = [];

    try {
      await this.s3Controller.uploadFile(resKey, resAvatar, 'image/png');
      succeededFiles.push(resKey);

      await this.s3Controller.uploadFile(spyKey, spyAvatar, 'image/png');
      succeededFiles.push(spyKey);
    } catch (e) {
      for (const succeededFile of succeededFiles) {
        await this.s3Controller.deleteObject(succeededFile);
      }

      throw e;
    }

    const resLink = `${this.s3Controller.getEndpoint()}${resKey}`;
    const spyLink = `${this.s3Controller.getEndpoint()}${spyKey}`;

    return { resLink, spyLink };
  }

  private getCurrentKeyCounter(listOfKeys: string[]) {
    let counter = 0;

    listOfKeys.forEach((key) => {
      // Match format /<username>_<res|spy>_<id>.png
      // const match = key.match(/\/([^/]+)_(spy|res)_(\d+)\.png$/);

      // TODO-kev: Thoughts on this one?
      // Match format <pending_avatars|approved_avatars>/<username>/<username>_<res|spy>_<id>.png
      const pattern = new RegExp(
        `^(${FolderName.PENDING}|${FolderName.APPROVE})\\/([^/]+)\\/\\2_(res|spy)_(\\d+)\\.png$`,
      );
      const match = key.match(pattern);

      if (match) {
        const count = parseInt(match[4], 10);
        if (count > counter) {
          counter = count;
        }
      }
    });

    return counter;
  }

  public async rejectAvatarRequest(link: string) {
    const pattern = new RegExp(`${FolderName.PENDING}\/.*$`);
    if (!link.match(pattern)) {
      throw new Error(`Invalid link provided: ${link}`);
    }

    const key = link.match(pattern)[0];
    console.log(key);

    await this.s3Controller.deleteObject(key);
  }

  public async approveAvatarRefactorFilePath(link: string) {
    // TODO-kev: Consider usernames pending_avatars
    const index = link.indexOf(FolderName.PENDING);
    const endpoint = link.substring(0, index);
    const key = link.substring(index);
    const newKey = key.replace(
      `${FolderName.PENDING}`,
      `${FolderName.APPROVE}`,
    );

    await this.s3Controller.refactorObjectFilepath(key, newKey);
    return `${endpoint}${newKey}`;
  }
}

// TODO-kev: Easy way to rename to s3Agent based on usages?
export const s3 = new S3Agent();
