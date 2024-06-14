const VALID_ENVIRONMENTS: Set<string> = new Set(['local', 'staging', 'prod']);

// TODO-kev: Should i import this into app.ts?
class Config {
  private readonly env: string;

  private readonly googleCaptchaKey: string;

  private readonly s3PublicFileLinkPrefix: string;
  private readonly s3BucketName: string;
  private readonly s3Region: string;
  private readonly s3Endpoint: string;

  private readonly patreonClientId: string;
  private readonly patreonClientSecret: string;
  private readonly patreonRedirectUrl: string;

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

    this.googleCaptchaKey = process.env.MY_SECRET_GOOGLE_CAPTCHA_KEY;

    this.s3PublicFileLinkPrefix = process.env.S3_PUBLIC_FILE_LINK_PREFIX;
    this.s3BucketName = process.env.S3_BUCKET_NAME;
    this.s3Region = process.env.S3_REGION;
    this.s3Endpoint = process.env.S3_ENDPOINT;

    this.patreonClientId = process.env.patreon_client_ID;
    this.patreonClientSecret = process.env.patreon_client_secret;
    this.patreonRedirectUrl = process.env.patreon_redirectURL;
  }

  public getEnv() {
    return this.env;
  }

  public getGoogleCaptchaKey() {
    return this.googleCaptchaKey;
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

  public getPatreonClientId() {
    return this.patreonClientId;
  }

  public getPatreonClientSecret() {
    return this.patreonClientSecret;
  }

  public getPatreonRedirectUrl() {
    return this.patreonRedirectUrl;
  }
}

export const config = new Config();
