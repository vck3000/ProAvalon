const VALID_ENVIRONMENTS: Set<string> = new Set(['local', 'staging', 'prod']);

// TODO-kev: Should i import this into app.ts?
class Config {
  private readonly env: string;
  private readonly nodeEnv: string;
  private readonly serverDomain: string;
  private readonly port: string;
  private readonly ip: string;
  private readonly mySecretKey: string;

  private readonly proAvalonEmailAddressDomain: string;
  private readonly proAvalonEmailAddress: string;
  private readonly mailgunApiKey: string;

  private readonly vpnDetectionToken: string;
  private readonly whitelistedVpnUsernames: string;
  private readonly googleCaptchaKey: string;
  private readonly databaseUrl: string;

  private readonly s3PublicFileLinkPrefix: string;
  private readonly s3BucketName: string;
  private readonly s3Region: string;
  private readonly s3Endpoint: string;

  private readonly patreonClientId: string;
  private readonly patreonClientSecret: string;
  private readonly patreonRedirectUrl: string;

  private readonly discordBotToken: string;
  private readonly discordAdminChannelId: string;
  private readonly discordModChannelId: string;
  private readonly discordAdminRoleId: string;
  private readonly discordModRoleId: string;

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
    this.nodeEnv = process.env.NODE_ENV;
    this.serverDomain = process.env.SERVER_DOMAIN;
    this.port = process.env.PORT;
    this.ip = process.env.IP;
    this.mySecretKey = process.env.MY_SECRET_KEY;

    this.proAvalonEmailAddress = process.env.PROAVALON_EMAIL_ADDRESS;
    this.proAvalonEmailAddressDomain =
      process.env.PROAVALON_EMAIL_ADDRESS_DOMAIN;
    this.mailgunApiKey = process.env.MAILGUN_API_KEY;

    this.vpnDetectionToken = process.env.VPN_DETECTION_TOKEN;
    this.whitelistedVpnUsernames = process.env.WHITELISTED_VPN_USERNAMES;
    this.googleCaptchaKey = process.env.MY_SECRET_GOOGLE_CAPTCHA_KEY;
    this.databaseUrl = process.env.DATABASEURL;

    this.s3PublicFileLinkPrefix = process.env.S3_PUBLIC_FILE_LINK_PREFIX;
    this.s3BucketName = process.env.S3_BUCKET_NAME;
    this.s3Region = process.env.S3_REGION;
    this.s3Endpoint = process.env.S3_ENDPOINT;

    this.patreonClientId = process.env.patreon_client_ID;
    this.patreonClientSecret = process.env.patreon_client_secret;
    this.patreonRedirectUrl = process.env.patreon_redirectURL;

    this.discordBotToken = process.env.discord_bot_token;
    this.discordAdminChannelId = process.env.discord_admin_channel_id;
    this.discordModChannelId = process.env.discord_mod_channel_id;
    this.discordAdminRoleId = process.env.discord_admin_role_id;
    this.discordModRoleId = process.env.discord_mod_role_id;
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

  public getPatreonClientId() {
    return this.patreonClientId;
  }

  public getPatreonClientSecret() {
    return this.patreonClientSecret;
  }

  public getPatreonRedirectUrl() {
    return this.patreonRedirectUrl;
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

export const config = new Config();
