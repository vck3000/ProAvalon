import S3Controller from './S3Controller';

enum FolderName {
  APPROVED = 'approved_avatars',
  PENDING = 'pending_avatars',
}

const SUPPORTED_EXTENSIONS = ['png'];

interface S3AvatarLinks {
  resLink: string;
  spyLink: string;
}

export class S3Agent {
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

    const succeededFileLinks = [];
    let resLink: string;
    let spyLink: string;

    try {
      resLink = await this.s3Controller.uploadFile(
        resKey,
        resAvatar,
        'image/png',
      );
      succeededFileLinks.push(resLink);

      spyLink = await this.s3Controller.uploadFile(
        spyKey,
        spyAvatar,
        'image/png',
      );
      succeededFileLinks.push(spyLink);
    } catch (e) {
      for (const succeededFileLink of succeededFileLinks) {
        await this.s3Controller.deleteObject(succeededFileLink);
      }

      throw e;
    }

    return {
      resLink,
      spyLink,
    };
  }

  private getCurrentKeyCounter(listOfKeys: string[]) {
    // Match format: Last occurrence /<username>_<res|spy>_<counter><file_extension>
    const pattern = new RegExp(
      `([^/]+)_(res|spy)_(\\d+)\\.(${SUPPORTED_EXTENSIONS.join('|')})$`,
    );

    return Math.max(...listOfKeys.map((key) => {
      const match = key.match(pattern);
      return match ? parseInt(match[3], 10) : 0;
    }));
  }

  public async rejectAvatarRequest(s3AvatarLinks: S3AvatarLinks) {
    if (!this.isValidPendingAvatarRequest(s3AvatarLinks)) {
      throw new Error(
        `Invalid links provided: resLink="${s3AvatarLinks.resLink}" spyLink="${s3AvatarLinks.spyLink}"`,
      );
    }

    await this.s3Controller.deleteObject(s3AvatarLinks.resLink);
    await this.s3Controller.deleteObject(s3AvatarLinks.spyLink);
  }

  public async approveAvatarRequest(s3AvatarLinks: S3AvatarLinks) {
    if (!this.isValidPendingAvatarRequest(s3AvatarLinks)) {
      throw new Error(
        `Invalid links provided: resLink="${s3AvatarLinks.resLink}" spyLink="${s3AvatarLinks.spyLink}"`,
      );
    }

    const newResLink = s3AvatarLinks.resLink.replace(
      FolderName.PENDING,
      FolderName.APPROVED,
    );
    const newSpyLink = s3AvatarLinks.spyLink.replace(
      FolderName.PENDING,
      FolderName.APPROVED,
    );

    await this.s3Controller.moveFile(s3AvatarLinks.resLink, newResLink);
    await this.s3Controller.moveFile(s3AvatarLinks.spyLink, newSpyLink);

    return {
      resLink: newResLink,
      spyLink: newSpyLink,
    };
  }

  private isValidPendingAvatarRequest(s3AvatarLinks: S3AvatarLinks) {
    return (
      this.s3Controller.isValidLink(s3AvatarLinks.resLink, FolderName.PENDING) &&
      this.s3Controller.isValidLink(s3AvatarLinks.spyLink, FolderName.PENDING)
    );
  }
}
