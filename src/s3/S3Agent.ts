import { fromEnv } from '@aws-sdk/credential-providers';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Buffer } from 'buffer';

enum Endpoints {
  LOCAL = 'http://localhost:9000/proavalon/',
  STAGING = 'https://s3-staging.proavalon.com/file/proavalon-staging/',
}

enum Bucket {
  LOCAL = 'proavalon',
  STAGING = 'proavalon-staging',
}

class S3Agent {
  private client: S3Client;
  private endpoint: string;
  private bucket: string;

  constructor() {
    if (process.env.ENV === 'local') {
      this.endpoint = Endpoints.LOCAL;
      this.bucket = Bucket.LOCAL;

      this.client = new S3Client({
        region: 'asdf',
        endpoint: 'http://127.0.0.1:9000',
        credentials: fromEnv(),
      });
    } else if (process.env.ENV == 'staging') {
      this.endpoint = Endpoints.STAGING;
      this.bucket = Bucket.STAGING;

      this.client = new S3Client({
        region: 'us-east-005',
        endpoint: 'https://s3.us-east-005.backblazeb2.com',
        credentials: fromEnv(),
      });
    }
  }

  public async objectExists(key: string) {
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(headCommand);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async listObjectKeys(...prefixes: string[]) {
    // Note ListObjects command only returns up to 1000 objects
    // Need to update code if this exceeds
    let keys: string[] = [];

    for (const prefix of prefixes) {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      });

      const s3Objects = await this.client.send(command);

      if (s3Objects.KeyCount !== 0) {
        s3Objects.Contents.forEach((object) => {
          keys.push(object.Key);
        });
      }
    }

    return keys;
  }

  public async uploadFile(key: string, fileContent: any, contentType: string) {
    if (await this.objectExists(key)) {
      throw new Error(`Failed to upload to s3. File already exists: '${key}'.`);
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
    });

    await this.client.send(command);

    console.log(`Successfully uploaded file to s3: ${key}`);
  }

  public async deleteObject(key: string) {
    if (!(await this.objectExists(key))) {
      throw new Error(
        `Failed to delete. s3 file does not exist: ${this.bucket}/${key}.`,
      );
    }

    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(deleteCommand);
    console.log(`Successfully deleted s3 file: ${this.bucket}/${key}.`);
  }

  public async refactorObjectFilepath(oldKey: string, newKey: string) {
    if (!(await this.objectExists(oldKey))) {
      throw new Error(
        `Failed to refactor s3 file. Object with key '${oldKey}' does not exist.`,
      );
    }

    if (await this.objectExists(newKey)) {
      throw new Error(
        `Failed to refactor s3 file. Destination object with key '${newKey}' already exists.`,
      );
    }

    const copyCommand = new CopyObjectCommand({
      Bucket: this.bucket,
      CopySource: `${this.bucket}/${oldKey}`,
      Key: newKey,
    });

    await this.client.send(copyCommand);
    await this.deleteObject(oldKey);

    console.log(
      `Successfully refactored filepath in s3 from: ${this.bucket}/${oldKey} to: ${this.bucket}/${newKey}`,
    );
  }

  // =====================================================
  // CUSTOM AVATAR FUNCTIONS
  // =====================================================

  // Uploads avatar requests to s3. Presumes validation checks have been completed
  // Returns accessible links for res and spy avatars
  // Note to add a new prefix for all files to be checked
  // TODO-kev check File type
  public async uploadAvatarRequestImages(
    username: string,
    resAvatar: Buffer,
    spyAvatar: Buffer,
  ) {
    const usernameLower = username.toLowerCase();
    const prefix1 = `pending_avatars/${usernameLower}/`;
    const prefix2 = `approved_avatars/${usernameLower}/`;

    // Find unique ID for filepath generation
    const existingObjectKeys = await this.listObjectKeys(prefix1, prefix2);
    const counter = this.getKeyCounter(existingObjectKeys);

    const resFileName = `${usernameLower}_res_${counter + 1}.png`;
    const spyFileName = `${usernameLower}_spy_${counter + 1}.png`;

    const resKey = `${prefix1}${resFileName}`;
    const spyKey = `${prefix1}${spyFileName}`;

    await this.uploadFile(resKey, resAvatar, 'image/png');
    await this.uploadFile(spyKey, spyAvatar, 'image/png');

    const resUrl = `${this.endpoint}${resKey}`;
    const spyUrl = `${this.endpoint}${spyKey}`;

    return [resUrl, spyUrl];
  }

  private getKeyCounter(listOfKeys: string[]) {
    let counter = 0;

    listOfKeys.forEach((key) => {
      // Match leading integer following the last occurrence of /
      const match = key.match(/\/([^/]+)_(spy|res)_(\d+)\.png$/);

      if (match) {
        const count = parseInt(match[3], 10);
        if (count > counter) {
          counter = count;
        }
      }
    });

    return counter;
  }

  public async rejectAvatarRequest(link: string) {
    const pattern = /pending_avatars\/.*$/;
    if (!link.match(pattern)) {
      throw new Error(`Invalid link provided: ${link}`);
    }

    const key = link.match(pattern)[0];

    await this.deleteObject(key);
  }

  public async approveAvatarRefactorFilePath(link: string) {
    // TODO-kev: Consider usernames pending_avatars
    const index = link.indexOf('pending_avatars');
    const endpoint = link.substring(0, index);
    const key = link.substring(index);
    const newKey = key.replace('pending_avatars', 'approved_avatars');

    await this.refactorObjectFilepath(key, newKey);
    return `${endpoint}${newKey}`;
  }
}

// TODO-kev: Easy way to rename to s3Agent based on usages?
export const s3 = new S3Agent();
