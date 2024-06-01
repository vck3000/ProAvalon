import { fromEnv } from '@aws-sdk/credential-providers';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { IS3Controller } from './S3Agent';

export default class S3Controller implements IS3Controller {
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
    const keys: string[] = [];

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

  public async uploadFile(
    key: string,
    fileContent: Buffer,
    contentType: string,
  ) {
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

  public async deleteFile(link: string) {
    const linkDetails = this.parseLink(link);

    if (!linkDetails) {
      throw new Error(
        `Could not delete s3 file. Invalid link provided: ${link}"`,
      );
    }

    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: linkDetails.key,
    });

    await this.client.send(deleteCommand);
    console.log(`Successfully deleted s3 file: ${link}`);
  }

  public async moveFile(oldLink: string, newLink: string) {
    const oldLinkDetails = this.parseLink(oldLink);
    const newLinkDetails = this.parseLink(newLink);

    if (!(await this.objectExists(oldLinkDetails.key))) {
      throw new Error(
        `Failed to move s3 file. File does not exist: ${oldLink}.`,
      );
    }

    if (await this.objectExists(newLinkDetails.key)) {
      throw new Error(
        `Failed to move s3 file. Destination link already exists: '${newLink}'`,
      );
    }

    const copyCommand = new CopyObjectCommand({
      Bucket: this.bucket,
      CopySource: `${this.bucket}/${oldLinkDetails.key}`,
      Key: newLinkDetails.key,
    });

    await this.client.send(copyCommand);
    await this.deleteFile(oldLink);

    console.log(`Successfully moved s3 file from: ${oldLink} to: ${newLink}`);
  }

  private parseLink(link: string) {
    if (!this.isValidLink(link)) {
      return null;
    }

    const key = link.split(this.publicFileLinkPrefix)[1];

    return {
      publicFileLinkPrefix: this.publicFileLinkPrefix,
      key: key,
    };
  }

  private isValidLink(link: string) {
    return link.startsWith(this.publicFileLinkPrefix);
  }

  public transformKeyToLink(key: string) {
    return `${this.publicFileLinkPrefix}${key}`;
  }
}
