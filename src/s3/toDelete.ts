// import { fromEnv } from '@aws-sdk/credential-providers';
// import {
//   CopyObjectCommand,
//   DeleteObjectCommand,
//   GetObjectCommand,
//   HeadObjectCommand,
//   ListObjectsV2Command,
//   PutObjectCommand,
//   S3Client,
// } from '@aws-sdk/client-s3';
// import user from '../models/user';
//
// enum Endpoints {
//   LOCAL = 'http://localhost:9000/proavalon/',
//   STAGING = 'https://s3-staging.proavalon.com/file/proavalon-staging/',
// }
//
// enum Bucket {
//   LOCAL = 'proavalon',
//   STAGING = 'proavalon-staging',
// }
//
// let client: S3Client;
// let endpoint: string;
// let bucket: string;
//
// if (process.env.ENV === 'local') {
//   endpoint = Endpoints.LOCAL;
//   bucket = Bucket.LOCAL;
//
//   client = new S3Client({
//     region: 'asdf',
//     endpoint: 'http://127.0.0.1:9000',
//     credentials: fromEnv(),
//   });
// } else if (process.env.ENV == 'staging') {
//   endpoint = Endpoints.STAGING;
//   bucket = Bucket.STAGING;
//
//   client = new S3Client({
//     region: 'us-east-005',
//     endpoint: 'https://s3.us-east-005.backblazeb2.com',
//     credentials: fromEnv(),
//   });
// }
//
// export async function s3ObjectExists(key: string) {
//   try {
//     const headCommand = new HeadObjectCommand({
//       Bucket: bucket,
//       Key: key,
//     });
//
//     await client.send(headCommand);
//     return true;
//   } catch (error) {
//     return false;
//   }
// }
//
// export async function s3GetFile(key: string) {
//   if (!(await s3ObjectExists(key))) {
//     return null;
//   }
//
//   const command = new GetObjectCommand({
//     Bucket: bucket,
//     Key: key,
//   });
//
//   return await client.send(command);
// }
//
// export async function s3ListObjectKeys(...prefixes: string[]) {
//   // Note ListObjects command only returns up to 1000 objects
//   // Need to update code if this exceeds
//   let keys: string[] = [];
//
//   for (const prefix of prefixes) {
//     const command = new ListObjectsV2Command({
//       Bucket: bucket,
//       Prefix: prefix,
//     });
//
//     const s3Objects = await client.send(command);
//
//     if (s3Objects.KeyCount !== 0) {
//       s3Objects.Contents.forEach((object) => {
//         keys.push(object.Key);
//       });
//     }
//   }
//
//   return keys;
// }
//
// export async function s3UploadFile(
//   key: string,
//   fileContent: any,
//   contentType: string,
// ) {
//   if (await s3ObjectExists(key)) {
//     throw new Error(`Failed to upload to s3. File already exists: '${key}'.`);
//   }
//
//   const command = new PutObjectCommand({
//     Bucket: bucket,
//     Key: key,
//     Body: fileContent,
//     ContentType: contentType,
//   });
//
//   await client.send(command);
//
//   console.log(`Successfully uploaded file to s3: ${key}`);
// }
//
// export async function s3DeleteObject(key: string) {
//   if (!(await s3ObjectExists(key))) {
//     throw new Error(
//       `Failed to delete. s3 file does not exist: ${bucket}/${key}.`,
//     );
//   }
//
//   const deleteCommand = new DeleteObjectCommand({
//     Bucket: bucket,
//     Key: key,
//   });
//
//   await client.send(deleteCommand);
//   console.log(`Successfully deleted s3 file: ${bucket}/${key}.`);
// }
//
// export async function s3RefactorObjectFilepath(oldKey: string, newKey: string) {
//   if (!(await s3ObjectExists(oldKey))) {
//     throw new Error(
//       `Failed to refactor s3 file. Object with key '${oldKey}' does not exist.`,
//     );
//   }
//
//   if (await s3ObjectExists(newKey)) {
//     throw new Error(
//       `Failed to refactor s3 file. Destination object with key '${newKey}' already exists.`,
//     );
//   }
//
//   const copyCommand = new CopyObjectCommand({
//     Bucket: bucket,
//     CopySource: `${bucket}/${oldKey}`,
//     Key: newKey,
//   });
//
//   await client.send(copyCommand);
//   await s3DeleteObject(oldKey);
//
//   console.log(
//     `Successfully refactored filepath in s3 from: ${bucket}/${oldKey} to: ${bucket}/${newKey}`,
//   );
// }
//
// // =====================================================
// // CUSTOM AVATAR FUNCTIONS
// // =====================================================
//
// // Uploads avatar requests to s3. Presumes validation checks have been completed
// // Returns accessible links for res and spy avatars
// // Note to add a new prefix for all files to be checked
// // TODO-kev check File type
// export async function uploadAvatarRequest(
//   username: string,
//   resAvatar: File,
//   spyAvatar: File,
// ) {
//   const usernameLower = username.toLowerCase();
//   const prefix1 = `pending_avatars/${usernameLower}/`;
//   const prefix2 = `approved_avatars/${usernameLower}/`;
//   const existingObjectKeys = await s3ListObjectKeys(prefix1, prefix2);
//
//   // Find unique ID for filepath generation
//   // TODO-kev: Extract below into another function
//   let currCounter = 0;
//
//   existingObjectKeys.forEach((key) => {
//     // Match leading integer following the last occurrence of /
//     const match = key.match(/\/([^/]+)_(spy|res)_(\d+)\.png$/);
//
//     if (match) {
//       const counter = parseInt(match[3], 10);
//       if (counter > currCounter) {
//         currCounter = counter;
//       }
//     }
//   });
//
//   const resKey = `${prefix1}${usernameLower}_res_${currCounter + 1}.png`;
//   const spyKey = `${prefix1}${usernameLower}_spy_${currCounter + 1}.png`;
//
//   await s3UploadFile(resKey, resAvatar, 'image/png');
//   await s3UploadFile(spyKey, spyAvatar, 'image/png');
//
//   const resUrl = `${endpoint}${resKey}`;
//   const spyUrl = `${endpoint}${spyKey}`;
//
//   return [resUrl, spyUrl];
// }
//
// export async function rejectAvatarRefactorFilePath(key: string) {
//   await s3DeleteObject(key);
// }
//
// export async function approveAvatarRefactorFilePath(key: string) {
//   const newKey = key.replace('pending_avatars', 'approved_avatars');
//   await s3RefactorObjectFilepath(key, newKey);
//   return newKey;
// }
