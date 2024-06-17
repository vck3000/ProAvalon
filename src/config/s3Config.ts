export type S3ConfigType = {
  PUBLIC_FILE_LINK_PREFIX: string;
  BUCKET_NAME: string;
  REGION: string;
  ENDPOINT: string;
};

export const S3Config: Readonly<S3ConfigType> = Object.freeze({
  PUBLIC_FILE_LINK_PREFIX: process.env.S3_PUBLIC_FILE_LINK_PREFIX,
  BUCKET_NAME: validateBucketName(),
  REGION: process.env.S3_REGION,
  ENDPOINT: process.env.S3_ENDPOINT,
});

function validateBucketName() {
  const { NODE_ENV, ENV, S3_BUCKET_NAME } = process.env;

  if (NODE_ENV !== 'test') {
    const expectedBucketNames: { [key: string]: string } = {
      prod: `proavalon`,
      staging: `proavalon-staging`,
    };

    const expectedBucketName = expectedBucketNames[ENV];

    if (expectedBucketName && S3_BUCKET_NAME !== expectedBucketName) {
      throw new Error(
        `Invalid env variables: ENV=${ENV} S3_BUCKET_NAME=${S3_BUCKET_NAME}`,
      );
    }
  }

  return S3_BUCKET_NAME;
}
