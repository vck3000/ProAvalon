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
    filepath = generateNewFilepath(filepath);
  } catch (error) {}

  const command = new PutObjectCommand({
    Bucket: 'proavalon',
    Key: filepath,
    Body: fileContent,
  });

  return await client.send(command);
}

export async function listObjectKeysFromS3(
  prefix: string,
  keyContains: string,
) {
  const command = new ListObjectsV2Command({
    Bucket: 'proavalon',
    Prefix: prefix,
  });

  const data = await client.send(command);

  data.Contents.forEach((object) => {
    const formattedKey = object.Key.substring(object.Key.lastIndexOf('/') + 1);

    if (formattedKey.includes(keyContains)) {
      console.log(object.Key);
    }
  });
}

function generateNewFilepath(filepath: string) {
  // TODO: Consider the test.txt_0 vs test_0.txt
  // Also perhaps consider adding a property to the user for their number of custom avatars to increment
  // Match a trailing _ followed by digits
  const regex = /_(\d+)$/;

  // Check if the filepath ends with an underscore followed by digits
  const match = filepath.match(regex);

  if (match) {
    const num = parseInt(match[1]);
    return filepath.replace(regex, `_${num + 1}`);
  } else {
    // If no match, append _0 to the filepath
    return `${filepath}_0`;
  }
}
