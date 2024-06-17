import { PatreonConfig, PatreonConfigType } from './patreonConfig';

const VALID_ENVIRONMENTS: Set<string> = new Set(['local', 'staging', 'prod']);

class Config {
  private readonly env: string = process.env.ENV;
  private readonly nodeEnv: string = process.env.NODE_ENV;
  private readonly serverDomain: string = process.env.SERVER_DOMAIN;
  private readonly port: string = process.env.PORT;
  private readonly ip: string = process.env.IP;
  private readonly mySecretKey: string = process.env.MY_SECRET_KEY;

  private readonly proAvalonEmailAddressDomain: string =
    process.env.PROAVALON_EMAIL_ADDRESS_DOMAIN;
  private readonly proAvalonEmailAddress: string =
    process.env.PROAVALON_EMAIL_ADDRESS;
  private readonly mailgunApiKey: string = process.env.MAILGUN_API_KEY;

  private readonly vpnDetectionToken: string = process.env.VPN_DETECTION_TOKEN;
  private readonly whitelistedVpnUsernames: string =
    process.env.WHITELISTED_VPN_USERNAMES;
  private readonly googleCaptchaKey: string =
    process.env.MY_SECRET_GOOGLE_CAPTCHA_KEY;
  private readonly databaseUrl: string = process.env.DATABASEURL;

  private readonly s3PublicFileLinkPrefix: string =
    process.env.S3_PUBLIC_FILE_LINK_PREFIX;
  private readonly s3BucketName: string = process.env.S3_BUCKET_NAME;
  private readonly s3Region: string = process.env.S3_REGION;
  private readonly s3Endpoint: string = process.env.S3_ENDPOINT;

  private readonly discordBotToken: string = process.env.discord_bot_token;
  private readonly discordAdminChannelId: string =
    process.env.discord_admin_channel_id;
  private readonly discordModChannelId: string =
    process.env.discord_mod_channel_id;
  private readonly discordAdminRoleId: string =
    process.env.discord_admin_role_id;
  private readonly discordModRoleId: string = process.env.discord_mod_role_id;

  constructor() {
    // Run validation checks outside test environment
    if (this.nodeEnv !== 'test') {
      if (!VALID_ENVIRONMENTS.has(this.env)) {
        // TODO-kev: Prefer the console.error then process exit or throw an error?
        console.error(`Bad environment variable given: ${process.env.ENV}`);
        throw new Error(`Invalid settings: ENV=${process.env.ENV}`);
        process.exit(1);
      }

      if (this.env === 'staging' && this.s3BucketName !== 'proavalon-staging') {
        throw new Error(
          `Invalid settings: ENV=staging S3_BUCKET_NAME=${process.env.S3_BUCKET_NAME}`,
        );
      }

      if (this.env === 'prod' && this.s3BucketName !== 'proavalon') {
        throw new Error(
          `Invalid settings: ENV=prod S3_BUCKET_NAME=${process.env.S3_BUCKET_NAME}`,
        );
      }
    }
  }

  public getEnv() {
    return this.env;
  }

  public getNodeEnv() {
    return this.nodeEnv;
  }

  public getServerDomain() {
    return this.serverDomain;
  }

  public getPort() {
    return this.port;
  }

  public getIp() {
    return this.ip;
  }

  public getMySecretKey() {
    return this.mySecretKey;
  }

  public getProAvalonEmailAddress() {
    return this.proAvalonEmailAddress;
  }

  public getProAvalonEmailAddressDomain() {
    return this.proAvalonEmailAddressDomain;
  }

  public getMailgunApiKey() {
    return this.mailgunApiKey;
  }

  public getVpnDetectionToken() {
    return this.vpnDetectionToken;
  }

  public getWhitelistedVpnUsernames() {
    return this.whitelistedVpnUsernames;
  }

  public getGoogleCaptchaKey() {
    return this.googleCaptchaKey;
  }

  public getDatabaseUrl() {
    return this.databaseUrl;
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

  public getDiscordBotToken() {
    return this.discordBotToken;
  }

  public getDiscordAdminChannelId() {
    return this.discordAdminChannelId;
  }

  public getDiscordModChannelId() {
    return this.discordModChannelId;
  }

  public getDiscordAdminRoleId() {
    return this.discordAdminRoleId;
  }

  public getDiscordModRoleId() {
    return this.discordModRoleId;
  }
}

type ConfigNew = {
  patreon: PatreonConfigType;
};

export const config: Readonly<ConfigNew> = Object.freeze({
  patreon: PatreonConfig,
});

export const configOld = new Config();
