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
import user from '../models/user';
const BUCKET_NAME = 'proavalon';

let client: S3Client;

if (process.env.ENV === 'local') {
  client = new S3Client({
    region: 'asdf',
    endpoint: 'http://127.0.0.1:9000',
    credentials: fromEnv(),
  });
} else if (process.env.ENV == 'staging') {
  client = new S3Client({
    region: 'us-east-005',
    endpoint: 'https://s3.us-east-005.backblazeb2.com',
    credentials: fromEnv(),
  });
}

export async function s3ObjectExists(key: string) {
  try {
    const headCommand = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await client.send(headCommand);
    return true;
  } catch (error) {
    return false;
  }
}

export async function s3GetFile(key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    return await client.send(command);
  } catch (error) {
    console.log(`Error retrieving file from s3: ${BUCKET_NAME}/${key}`);
    return null;
  }
}

export async function s3ListObjectKeys(...prefixes: string[]) {
  // Note ListObjects command only returns up to 1000 objects
  // Need to update code if this exceeds
  // TODO-kev: Wrap in a try catch?
  let keys: string[] = [];

  for (const prefix of prefixes) {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    });

    const s3Objects = await client.send(command);

    if (s3Objects.KeyCount !== 0) {
      s3Objects.Contents.forEach((object) => {
        keys.push(object.Key);
      });
    }
  }

  return keys;
}

export async function s3UploadFile(
  key: string,
  fileContent: any,
  contentType: string,
) {
  if (await s3ObjectExists(key)) {
    // TODO-kev: Should I throw an error here? If so how?
    console.log(`Failed to upload to s3. File already exists: '${key}'.`);
    return false;
  }

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
    });

    await client.send(command);

    console.log(`Successfully uploaded file to s3: ${key}`);
    return true;
  } catch (error) {
    console.error(`Error uploading file to S3: ${key}`, error);
    return false;
  }
}

export async function s3DeleteObject(key: string) {
  if (!(await s3ObjectExists(key))) {
    // TODO-kev: Throw an error here?
    console.log(
      `Failed to delete. s3 file does not exist: ${BUCKET_NAME}/${key}.`,
    );
    return false;
  }

  const deleteCommand = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await client.send(deleteCommand);
  console.log(`Successfully deleted s3 file: ${BUCKET_NAME}/${key}.`);

  return true;
}

export async function s3RefactorObjectFilepath(oldKey: string, newKey: string) {
  if (!(await s3ObjectExists(oldKey))) {
    // TODO-kev: Should I throw an error here? If so how?
    console.error(
      `Failed to refactor s3 file. Object with key '${oldKey}' does not exist.`,
    );
    return false;
  }

  if (await s3ObjectExists(newKey)) {
    // TODO-kev: Should I throw an error here? If so how?
    console.error(
      `Failed to refactor s3 file. Destination object with key '${newKey}' already exists.`,
    );
    return false;
  }

  const copyCommand = new CopyObjectCommand({
    Bucket: BUCKET_NAME,
    CopySource: `${BUCKET_NAME}/${oldKey}`,
    Key: newKey,
  });

  await client.send(copyCommand);

  if (!(await s3DeleteObject(oldKey))) {
    return false;
  }

  console.log(
    `Successfully refactored filepath in s3 from: ${BUCKET_NAME}/${oldKey} to: ${BUCKET_NAME}/${newKey}`,
  );
  return true;
}

// =====================================================
// CUSTOM AVATAR FUNCTIONS
// =====================================================

// Uploads avatar requests to s3. Presumes validation checks have been completed
// Returns accessible links for res and spy avatars
// Note to add a new prefix for all files to be checked
// TODO-kev check File type
export async function uploadAvatarRequest(
  username: string,
  resAvatar: File,
  spyAvatar: File,
) {
  const usernameLower = username.toLowerCase();
  const prefix1 = `pending_avatars/${usernameLower}/`;
  const prefix2 = `approved_avatars/${usernameLower}/`;
  const existingObjectKeys = await s3ListObjectKeys(prefix1, prefix2);

  // Find unique ID for filepath generation
  // TODO-kev: Extract below into another function
  let currCounter = 0;

  existingObjectKeys.forEach((key) => {
    // Match leading integer following the last occurrence of /
    const match = key.match(/\/([^/]+)_(spy|res)_(\d+)\.png$/);

    if (match) {
      const counter = parseInt(match[3], 10);
      if (counter > currCounter) {
        currCounter = counter;
      }
    }
  });

  const resKey = `${prefix1}${usernameLower}_res_${currCounter + 1}.png`;
  const spyKey = `${prefix1}${usernameLower}_spy_${currCounter + 1}.png`;

  await s3UploadFile(resKey, resAvatar, 'image/png');
  await s3UploadFile(spyKey, spyAvatar, 'image/png');

  // TODO-kev: Edit the below based on prod
  // Note removed 'localhost:3000' due to errors in rendering img
  const endpoint = '/avatars_s3/';

  const resUrl = `${endpoint}${resKey}`;
  const spyUrl = `${endpoint}${spyKey}`;

  return [resUrl, spyUrl];
}

export async function rejectAvatarRefactorFilePath(key: string) {
  await s3DeleteObject(key);
}

export async function approveAvatarRefactorFilePath(key: string) {
  const newKey = key.replace('pending_avatars', 'approved_avatars');
  await s3RefactorObjectFilepath(key, newKey);
  return newKey;
}
