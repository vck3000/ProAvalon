import { Buffer } from 'buffer';
import { S3Controller } from './S3Controller';

enum FolderName {
  APPROVED = 'approved_avatars',
  PENDING = 'pending_avatars',
}

interface S3AvatarLinks {
  resLink: string;
  spyLink: string;
}

class S3Agent {
  private s3Controller: S3Controller;

  constructor() {
    this.s3Controller = new S3Controller();
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
  ): Promise<S3AvatarLinks> {
    const usernameLower = username.toLowerCase();
    const prefix1 = `${FolderName.PENDING}/${usernameLower}/`;
    const prefix2 = `${FolderName.APPROVED}/${usernameLower}/`;

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

    return {
      resLink: `${this.s3Controller.getPublicFileLinkPrefix()}${resKey}`,
      spyLink: `${this.s3Controller.getPublicFileLinkPrefix()}${spyKey}`,
    };
  }

  private getCurrentKeyCounter(listOfKeys: string[]) {
    let counter = 0;

    listOfKeys.forEach((key) => {
      // Match format /<username>_<res|spy>_<id>.png
      // const match = key.match(/\/([^/]+)_(spy|res)_(\d+)\.png$/);

      // TODO-kev: Thoughts on this one?
      // Match format <pending_avatars|approved_avatars>/<username>/<username>_<res|spy>_<id>.png
      const pattern = new RegExp(
        `^(${FolderName.PENDING}|${FolderName.APPROVED})\\/([^/]+)\\/\\2_(res|spy)_(\\d+)\\.png$`,
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

  public async rejectAvatarRequest(s3AvatarLinks: S3AvatarLinks) {
    if (!this.isValidPendingAvatarRequest(s3AvatarLinks)) {
      throw new Error(
        `Invalid links provided: resLink="${s3AvatarLinks.resLink}" spyLink="${s3AvatarLinks.spyLink}"`,
      );
    }

    const resLinkSplit = this.s3Controller.splitLink(s3AvatarLinks.resLink);
    const spyLinkSplit = this.s3Controller.splitLink(s3AvatarLinks.spyLink);

    await this.s3Controller.deleteObject(resLinkSplit.key);
    await this.s3Controller.deleteObject(spyLinkSplit.key);
  }

  public async approveAvatarRequest(s3AvatarLinks: S3AvatarLinks) {
    if (!this.isValidPendingAvatarRequest(s3AvatarLinks)) {
      throw new Error(
        `Invalid links provided: resLink="${s3AvatarLinks.resLink}" spyLink="${s3AvatarLinks.spyLink}"`,
      );
    }

    const resLinkSplit = this.s3Controller.splitLink(s3AvatarLinks.resLink);
    const spyLinkSplit = this.s3Controller.splitLink(s3AvatarLinks.spyLink);

    const resNewKey = resLinkSplit.key.replace(
      `${FolderName.PENDING}`,
      `${FolderName.APPROVED}`,
    );

    const spyNewKey = spyLinkSplit.key.replace(
      `${FolderName.PENDING}`,
      `${FolderName.APPROVED}`,
    );

    await this.s3Controller.moveFile(resLinkSplit.key, resNewKey);
    await this.s3Controller.moveFile(spyLinkSplit.key, spyNewKey);

    const approvedS3AvatarLinks: S3AvatarLinks = {
      resLink: `${resLinkSplit.publicFileLinkPrefix}${resNewKey}`,
      spyLink: `${spyLinkSplit.publicFileLinkPrefix}${spyNewKey}`,
    };

    return approvedS3AvatarLinks;
  }

  private isValidPendingAvatarRequest(s3AvatarLinks: S3AvatarLinks) {
    return (
      this.s3Controller.isValidLink(s3AvatarLinks.resLink, [
        FolderName.PENDING,
      ]) &&
      this.s3Controller.isValidLink(s3AvatarLinks.spyLink, [FolderName.PENDING])
    );
  }
}

// TODO-kev: Easy way to rename to s3Agent based on usages?
export const s3 = new S3Agent();
