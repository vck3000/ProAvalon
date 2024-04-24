import { fromEnv } from '@aws-sdk/credential-providers';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

export default class S3Controller {
  private client: S3Client;
  private publicFileLinkPrefix: string;
  private bucket: string;

  constructor() {
    this.publicFileLinkPrefix = process.env.S3_PUBLIC_FILE_LINK_PREFIX;
    this.bucket = process.env.S3_BUCKET_NAME;

    this.client = new S3Client({
      region: process.env.S3_REGION,
      endpoint: process.env.S3_ENDPOINT,
      credentials: fromEnv(),
    });
  }

  private async objectExists(key: string) {
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(headCommand);
      return true;
    } catch (e) {
      if (e.$metadata.httpStatusCode === 404) {
        return false;
      } else {
        throw e;
      }
    }
  }

  public async listObjectKeys(prefixes: string[]) {
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

  // TODO-kev: Get the StreamingBlobPayloadInputTypes to work
  // public async uploadFile(key: string, fileContent: StreamingBlobPayloadInputTypes,, contentType: string) {
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

    return `${this.publicFileLinkPrefix}${key}`;
  }

  public async deleteObject(link: string) {
    const splitLink = this.splitLink(link);

    if (!splitLink) {
      throw new Error(
        `Could not delete s3 file. Invalid link provided: ${link}"`,
      );
    }

    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: splitLink.key,
    });

    await this.client.send(deleteCommand);
    console.log(`Successfully deleted s3 file: ${link}`);
  }

  public async moveFile(oldLink: string, newLink: string) {
    const splitOldLink = this.splitLink(oldLink);
    const splitNewLink = this.splitLink(newLink);

    if (!(await this.objectExists(splitOldLink.key))) {
      throw new Error(
        `Failed to move s3 file. File does not exist: ${oldLink}.`,
      );
    }

    if (await this.objectExists(splitNewLink.key)) {
      throw new Error(
        `Failed to move s3 file. Destination link already exists: '${newLink}'`,
      );
    }

    const copyCommand = new CopyObjectCommand({
      Bucket: this.bucket,
      CopySource: `${this.bucket}/${splitOldLink.key}`,
      Key: splitNewLink.key,
    });

    await this.client.send(copyCommand);
    await this.deleteObject(oldLink);

    console.log(`Successfully moved s3 file from: ${oldLink} to: ${newLink}`);
  }

  private splitLink(link: string) {
    if (!link.includes(this.publicFileLinkPrefix)) {
      return null;
    }

    const key = link.split(this.publicFileLinkPrefix)[1];

    return {
      publicFileLinkPrefix: this.publicFileLinkPrefix,
      key: key,
    };
  }

  public isValidLink(link: string, subsequentString: string) {
    // Match format: <publicFileLinkPrefix><subsequentString>
    const patternString = `^${this.publicFileLinkPrefix}${subsequentString}.*`;
    const pattern = new RegExp(patternString);
    const match = link.match(pattern);

    // TODO-kev: or change to !!match?
    return Boolean(match);
  }
}
