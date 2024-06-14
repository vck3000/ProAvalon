const VALID_ENVIRONMENTS: Set<string> = new Set(['local', 'staging', 'prod']);

// TODO-kev: Should i import this into app.ts?
class Config {
  private readonly env: string;

  private readonly s3PublicFileLinkPrefix: string;
  private readonly s3BucketName: string;
  private readonly s3Region: string;
  private readonly s3Endpoint: string;

  constructor() {
    if (!VALID_ENVIRONMENTS.has(process.env.ENV)) {
      // TODO-kev: Prefer the console.error then process exit or throw an error?
      console.error(`Bad environment variable given: ${process.env.ENV}`);
      throw new Error(`Invalid settings: ENV=${process.env.ENV}`);
      process.exit(1);
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

    this.env = process.env.ENV;

    this.s3PublicFileLinkPrefix = process.env.S3_PUBLIC_FILE_LINK_PREFIX;
    this.s3BucketName = process.env.S3_BUCKET_NAME;
    this.s3Region = process.env.S3_REGION;
    this.s3Endpoint = process.env.S3_ENDPOINT;
  }

  public getEnv() {
    return this.env;
  }

  public getS3PublicFileLinkPrefix() {
    return this.s3PublicFileLinkPrefix;
  }

  public getS3BucketName() {
    return this.s3BucketName;
  }

  public getS3Region() {
    return this.s3Region;
  }

  public getS3Endpoint() {
    return this.s3Endpoint;
  }
}

export const config = new Config();
