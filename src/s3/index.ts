import { fromEnv } from '@aws-sdk/credential-providers';
import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

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

export async function uploadFileToS3(filepath: string, fileContent: any) {
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
    });

    const response = await client.send(command);

    console.log(
      `Successfully uploaded file to s3. Bucket: proavalon, Filepath: ${filepath}`,
    );

    return response;
  } catch (error) {}
}

export async function uploadAvatarRequest(username: string) {
  const prefix = `avatars/${username.toLowerCase()}/`;
  const existingObjects = await listObjectKeysFromS3(prefix);

  // Find unique ID for filepath generation
  let currCounter = 0;

  existingObjects.Contents.forEach((object) => {
    const key = object.Key;
    // Match leading integer following the last occurrence of /
    const match = key.match(/\/(\d+)_/);

    if (match) {
      const counter = parseInt(match[1], 10);
      if (counter > currCounter) {
        currCounter = counter;
      }
    }
  });

  const filePath = `${prefix}${currCounter + 1}_res.txt`;
  const fileContent = 'Heloooo.';

  await uploadFileToS3(filePath, fileContent);
}

export async function listObjectKeysFromS3(prefix: string) {
  const command = new ListObjectsV2Command({
    Bucket: 'proavalon',
    Prefix: prefix,
  });

  return await client.send(command);
}
