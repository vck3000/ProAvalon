import { fromEnv } from '@aws-sdk/credential-providers';
import {
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

export async function getFileFromS3(filename: string) {
  const command = new GetObjectCommand({
    Bucket: 'proavalon',
    Key: filename,
  });

  return await client.send(command);
}

export async function uploadFileToS3(
  filepath: string,
  fileContent: any,
  contentType: string,
) {
  try {
    const headCommand = new HeadObjectCommand({
      Bucket: 'proavalon',
      Key: filepath,
    });

    await client.send(headCommand);
    console.log(
      `Failed to upload to s3. Object with key '${filepath}' already exists in the bucket.`,
    );
    // TODO: Should I throw an error here? If so how?
    return;
  } catch (error) {}

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

    return response;
  } catch (error) {}
}

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
  const existingObjects = await listObjectKeysFromS3(prefix);

  // Find unique ID for filepath generation
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

  await uploadFileToS3(resKey, resAvatar, 'image/png');
  await uploadFileToS3(spyKey, spyAvatar, 'image/png');

  // TODO: Edit the below based on prod
  const endpoint = 'localhost:3000/avatars_s3/';

  const resUrl = `${endpoint}${resKey}`;
  const spyUrl = `${endpoint}${spyKey}`;

  return [resUrl, spyUrl];
}

export async function listObjectKeysFromS3(prefix: string) {
  // Note ListObjects command only returns up to 1000 objects
  // Need to update code if this exceeds
  const command = new ListObjectsV2Command({
    Bucket: 'proavalon',
    Prefix: prefix,
  });

  return await client.send(command);
}
