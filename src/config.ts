const VALID_ENVIRONMENTS: Set<string> = new Set(['local', 'staging', 'prod']);

// TODO-kev: Should i import this into app.ts?
class Config {
  private readonly env: string;

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
  }

  public getEnv() {
    return this.env;
  }
}

export const config = new Config();
