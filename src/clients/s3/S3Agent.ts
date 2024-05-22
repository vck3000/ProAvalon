enum FolderName {
  APPROVED = 'approved_avatars',
  PENDING = 'pending_avatars',
}

const SUPPORTED_EXTENSIONS = ['png'];

interface S3AvatarSet {
  avatarSetId: number;
  resLink: string;
  spyLink: string;
}

export interface IS3Controller {
  listObjectKeys(prefixes: string[]): Promise<string[]>;
  uploadFile(key: string, fileContent: Buffer, contentType: string): any;
  deleteFile(link: string): any;
  moveFile(oldLink: string, newLink: string): any;
}

export class S3Agent {
  private s3Controller: IS3Controller;

  constructor(controller: IS3Controller) {
    this.s3Controller = controller;
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
  ): Promise<S3AvatarSet> {
    const usernameLower = username.toLowerCase();
    const pendingPrefixWithUsername = `${FolderName.PENDING}/${usernameLower}/`;

    // Find unique ID for filepath generation
    const existingObjectKeys = await this.s3Controller.listObjectKeys([
      pendingPrefixWithUsername,
      `${FolderName.APPROVED}/${usernameLower}/`,
    ]);
    const newAvatarId = this.getCurrentKeyCounter(existingObjectKeys) + 1;

    const resFileName = `${usernameLower}_res_${newAvatarId}.png`;
    const spyFileName = `${usernameLower}_spy_${newAvatarId}.png`;

    const resKey = `${pendingPrefixWithUsername}${resFileName}`;
    const spyKey = `${pendingPrefixWithUsername}${spyFileName}`;

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
        await this.s3Controller.deleteFile(succeededFileLink);
      }

      throw e;
    }

    return {
      avatarSetId: newAvatarId,
      resLink,
      spyLink,
    };
  }

  private getCurrentKeyCounter(listOfKeys: string[]) {
    if (listOfKeys.length === 0) {
      return 0;
    }

    // Match format: Last occurrence /<username>_<res|spy>_<counter><file_extension>
    const pattern = new RegExp(
      `([^/]+)_(res|spy)_(\\d+)\\.(${SUPPORTED_EXTENSIONS.join('|')})$`,
    );

    return Math.max(
      ...listOfKeys.map((key) => {
        const match = key.match(pattern);
        return match ? parseInt(match[3], 10) : 0;
      }),
    );
  }

  public async rejectAvatarRequest(s3AvatarSet: S3AvatarSet) {
    if (!this.isValidPendingAvatarRequest(s3AvatarSet)) {
      throw new Error(
        `Invalid links provided: resLink="${s3AvatarSet.resLink}" spyLink="${s3AvatarSet.spyLink}"`,
      );
    }

    await this.s3Controller.deleteFile(s3AvatarSet.resLink);
    await this.s3Controller.deleteFile(s3AvatarSet.spyLink);
  }

  public async approveAvatarRequest(
    s3AvatarSet: S3AvatarSet,
  ): Promise<S3AvatarSet> {
    if (!this.isValidPendingAvatarRequest(s3AvatarSet)) {
      throw new Error(
        `Invalid links provided: resLink="${s3AvatarSet.resLink}" spyLink="${s3AvatarSet.spyLink}"`,
      );
    }

    const newResLink = s3AvatarSet.resLink.replace(
      FolderName.PENDING,
      FolderName.APPROVED,
    );
    const newSpyLink = s3AvatarSet.spyLink.replace(
      FolderName.PENDING,
      FolderName.APPROVED,
    );

    let firstOnePassed = false;

    try {
      await this.s3Controller.moveFile(s3AvatarSet.resLink, newResLink);
      firstOnePassed = true;

      await this.s3Controller.moveFile(s3AvatarSet.spyLink, newSpyLink);
    } catch (e) {
      // If the first one passed but the second one failed, move the first one back.
      if (firstOnePassed) {
        await this.s3Controller.moveFile(newResLink, s3AvatarSet.resLink);
      }

      throw e;
    }

    return {
      avatarSetId: s3AvatarSet.avatarSetId,
      resLink: newResLink,
      spyLink: newSpyLink,
    };
  }

  private isValidPendingAvatarRequest(s3AvatarLinks: S3AvatarSet) {
    return (
      s3AvatarLinks.resLink.includes(FolderName.PENDING) &&
      s3AvatarLinks.spyLink.includes(FolderName.PENDING)
    );
  }

  public async getApprovedAvatarIdsForUser(usernameLower: string) {
    // Assumes each res avatar has a corresponding spy avatar with same id
    const existingResObjectKeys = await this.s3Controller.listObjectKeys([
      `${FolderName.APPROVED}/${usernameLower}/${usernameLower}_res_`,
    ]);

    return existingResObjectKeys
      .map((key) => {
        // Match format: Number of digits following _res_
        const match = key.match(/_res_(\d+)/);
        return match ? Number(match[1]) : NaN;
      })
      .filter((approvedAvatarId) => !isNaN(approvedAvatarId))
      .sort((a, b) => a - b);
  }
}
