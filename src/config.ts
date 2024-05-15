const VALID_ENVIRONMENTS = ['local', 'staging', 'prod'];
if (!VALID_ENVIRONMENTS.includes(process.env.ENV)) {
  throw new Error(`Invalid settings: ENV=${process.env.ENV}`);
}

if (
  process.env.ENV === 'staging' &&
  process.env.S3_BUCKET_NAME !== 'proavalon-staging'
) {
  throw new Error(
    `Invalid settings: ENV=staging S3_BUCKET_NAME=${process.env.S3_BUCKET_NAME}`,
  );
}

if (
  process.env.ENV === 'prod' &&
  process.env.S3_BUCKET_NAME !== 'proavalon'
) {
  throw new Error(
    `Invalid settings: ENV=prod S3_BUCKET_NAME=${process.env.S3_BUCKET_NAME}`,
  );
}
