import { getRequiredEnvVariable } from './utils';

export type S3ConfigType = {
  PUBLIC_FILE_LINK_PREFIX: string;
  BUCKET_NAME: string;
  REGION: string;
  ENDPOINT: string;
};

export const S3Config: Readonly<S3ConfigType> = Object.freeze({
  PUBLIC_FILE_LINK_PREFIX: getRequiredEnvVariable('S3_PUBLIC_FILE_LINK_PREFIX'),
  BUCKET_NAME: validateBucketName(),
  REGION: getRequiredEnvVariable('S3_REGION'),
  ENDPOINT: getRequiredEnvVariable('S3_ENDPOINT'),
});

function validateBucketName() {
  const S3_BUCKET_NAME = getRequiredEnvVariable('S3_BUCKET_NAME');

  if (
    (process.env.ENV === 'prod' && S3_BUCKET_NAME !== `proavalon`) ||
    (process.env.ENV === 'staging' && S3_BUCKET_NAME !== `proavalon-staging`)
  ) {
    console.error(
      `Invalid env variables: ENV=${process.env.ENV} S3_BUCKET_NAME=${S3_BUCKET_NAME}`,
    );
    process.exit(1);
  }

  return S3_BUCKET_NAME;
}
