import { fromEnv } from '@aws-sdk/credential-providers';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Buffer } from 'buffer';

// TODO-kev: ts complaining if set as variable: 'local' | 'staging' | 'prod'
function getEndpoint(variable: string): string {
  switch (variable) {
    case 'local':
      return 'http://localhost:9000/proavalon/';
    case 'staging':
      return 'https://s3-staging.proavalon.com/file/proavalon-staging/';
    case 'prod':
      return 'TO BE ADDED';
  }
}

// TODO-kev: ts complaining if set as variable: 'local' | 'staging' | 'prod'
function getBucket(variable: string): string {
  switch (variable) {
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
  private endpoint: string;
  private bucket: string;

  constructor(env: string) {
    this.endpoint = getEndpoint(env);
    this.bucket = getBucket(env);

    if (env === 'local') {
      this.client = new S3Client({
        region: 'asdf',
        endpoint: 'http://127.0.0.1:9000',
        credentials: fromEnv(),
      });
    } else if (env == 'staging') {
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
    if (!(await this.objectExists(key))) {
      console.log(
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

  public getEndpoint() {
    return this.endpoint;
  }
}
