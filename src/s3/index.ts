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

export async function s3GetFile(filename: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: 'proavalon',
      Key: filename,
    });
    return await client.send(command);
  } catch (error) {
    return null;
  }
}

export async function s3ObjectExists(key: string) {
  try {
    const headCommand = new HeadObjectCommand({
      Bucket: 'proavalon',
      Key: key,
    });

    await client.send(headCommand);
    return true;
  } catch (error) {
    return false;
  }
}

export async function s3UploadFile(
  filepath: string,
  fileContent: any,
  contentType: string,
) {
  if (!(await s3ObjectExists(filepath))) {
    // TODO-kev: Should I throw an error here? If so how?
    console.log(
      `Failed to upload to s3. Object with key '${filepath}' already exists.`,
    );
    return null;
  }

  try {
    const command = new PutObjectCommand({
      Bucket: 'proavalon',
      Key: filepath,
      Body: fileContent,
      ContentType: contentType,
    });

    const response = await client.send(command);

    console.log(
      `Successfully uploaded file to s3. Bucket: proavalon, Filepath: ${filepath}`,
    );

    return filepath;
  } catch (error) {
    console.error(`Error uploading file ${filepath} to S3:`, error);
    return null;
  }
}

export async function s3ListObjectKeys(prefix: string) {
  // Note ListObjects command only returns up to 1000 objects
  // Need to update code if this exceeds
  // TODO-kev: Wrap in a try catch?
  const command = new ListObjectsV2Command({
    Bucket: 'proavalon',
    Prefix: prefix,
  });

  return await client.send(command);
}

export async function s3RefactorObjectFilepath(
  oldFilepath: string,
  newFilepath: string,
) {
  if (!(await s3ObjectExists(oldFilepath))) {
    // TODO-kev: Should I throw an error here? If so how?
    console.error(
      `Failed to refactor s3 file. Object with key '${oldFilepath}' does not exist.`,
    );
    return false;
  }

  if (!(await s3ObjectExists(newFilepath))) {
    // TODO-kev: Should I throw an error here? If so how?
    console.error(
      `Failed to refactor s3 file. Destination object with key '${newFilepath}' already exists.`,
    );
    return false;
  }

  const copyCommand = new CopyObjectCommand({
    Bucket: 'proavalon',
    CopySource: `proavalon/${oldFilepath}`,
    Key: newFilepath,
  });

  await client.send(copyCommand);

  const deleteCommand = new DeleteObjectCommand({
    Bucket: 'proavalon',
    Key: oldFilepath,
  });

  await client.send(deleteCommand);

  console.log(
    `Successfully refactored filepath in s3 from: ${oldFilepath} to: ${newFilepath}`,
  );
  return true;
}

// =====================================================
// CUSTOM AVATAR FUNCTIONS
// =====================================================

// Uploads avatar requests to s3. Presumes validation checks have been completed
// Returns accessible links for res and spy avatars
// TODO-kev check File type
export async function uploadAvatarRequest(
  username: string,
  resAvatar: File,
  spyAvatar: File,
) {
  const usernameLower = username.toLowerCase();
  const prefix = `pending_avatars/${usernameLower}/`;
  const existingObjects = await s3ListObjectKeys(prefix);

  // Find unique ID for filepath generation
  // TODO-kev: Extract below into another function
  let currCounter = 0;

  if (existingObjects.KeyCount !== 0) {
    existingObjects.Contents.forEach((object) => {
      const key = object.Key;
      // Match leading integer following the last occurrence of /
      const match = key.match(/\/([^/]+)_(spy|res)_(\d+)\.png$/);

      if (match) {
        const counter = parseInt(match[3], 10);
        if (counter > currCounter) {
          currCounter = counter;
        }
      }
    });
  }

  const resKey = `${prefix}${usernameLower}_res_${currCounter + 1}.png`;
  const spyKey = `${prefix}${usernameLower}_spy_${currCounter + 1}.png`;

  await s3UploadFile(resKey, resAvatar, 'image/png');
  await s3UploadFile(spyKey, spyAvatar, 'image/png');

  // TODO-kev: Edit the below based on prod
  // Note removed 'localhost:3000' due to errors in rendering img
  const endpoint = '/avatars_s3/';

  const resUrl = `${endpoint}${resKey}`;
  const spyUrl = `${endpoint}${spyKey}`;

  return [resUrl, spyUrl];
}

export async function rejectAvatarRefactorFilePath(filepath: string) {
  const newFilepath = filepath.replace('pending_avatars', 'rejected_avatars');
  await s3RefactorObjectFilepath(filepath, newFilepath);
  return newFilepath;
}

export async function approveAvatarRefactorFilePath(filepath: string) {
  const newFilepath = filepath.replace('pending_avatars', 'approved_avatars');
  await s3RefactorObjectFilepath(filepath, newFilepath);
  return newFilepath;
}
