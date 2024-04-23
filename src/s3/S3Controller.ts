import { fromEnv } from '@aws-sdk/credential-providers';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

// TODO-kev: ts complaining if set as variable: 'local' | 'staging' | 'prod'
function getPublicFileLinkPrefix(env: string): string {
  switch (env) {
    case 'local':
      return 'http://localhost:9000/proavalon/';
    case 'staging':
      return 'https://s3-staging.proavalon.com/';
    case 'prod':
      return 'TO BE ADDED';
  }
}

// TODO-kev: ts complaining if set as variable: 'local' | 'staging' | 'prod'
function getBucket(env: string): string {
  switch (env) {
    case 'local':
      return 'proavalon';
    case 'staging':
      return 'proavalon-staging';
    case 'prod':
      return 'TO BE ADDED';
  }
}

export class S3Controller {
  private client: S3Client;
  private publicFileLinkPrefix: string;
  private bucket: string;

  constructor() {
    this.publicFileLinkPrefix = getPublicFileLinkPrefix(process.env.ENV);
    this.bucket = getBucket(process.env.ENV);

    if (process.env.ENV === 'local') {
      this.client = new S3Client({
        region: 'asdf',
        endpoint: 'http://127.0.0.1:9000',
        credentials: fromEnv(),
      });
    } else if (process.env.ENV == 'staging') {
      this.client = new S3Client({
        region: 'auto',
        endpoint: 'asdf',
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
    } catch (e) {
      if (
        e.name === 'NotFound' &&
        e.$metadata &&
        e.$metadata.httpStatusCode === 404
      ) {
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
    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(deleteCommand);
    console.log(`Successfully deleted s3 file: key="${this.bucket}/${key}."`);
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

  public getPublicFileLinkPrefix() {
    return this.publicFileLinkPrefix;
  }

  public splitLink(link: string) {
    if (!link.includes(this.publicFileLinkPrefix)) {
      return null;
    }

    const key = link.split(this.publicFileLinkPrefix)[1];

    return {
      publicFileLinkPrefix: this.publicFileLinkPrefix,
      key: key,
    };
  }

  public isValidLink(link: string, requiredStrings: string[]) {
    // TODO-kev: Keep as regex or use this hack?
    return (
      link.includes(this.publicFileLinkPrefix) &&
      requiredStrings.every((string) => link.includes(string))
    );
  }
}
