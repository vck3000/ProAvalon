import { PatreonConfig, PatreonConfigType } from './patreonConfig';
import { DiscordConfig, DiscordConfigType } from './discord';
import { S3Config, S3ConfigType } from './s3Config';
import { EmailConfig, EmailConfigType } from './emailConfig';

const VALID_ENVIRONMENTS: Set<string> = new Set(['local', 'staging', 'prod']);

class Config {
  private readonly env: string = process.env.ENV;
  private readonly serverDomain: string = process.env.SERVER_DOMAIN;
  private readonly port: string = process.env.PORT;
  private readonly ip: string = process.env.IP;
  private readonly mySecretKey: string = process.env.MY_SECRET_KEY;

  private readonly vpnDetectionToken: string = process.env.VPN_DETECTION_TOKEN;
  private readonly whitelistedVpnUsernames: string =
    process.env.WHITELISTED_VPN_USERNAMES;
  private readonly googleCaptchaKey: string =
    process.env.MY_SECRET_GOOGLE_CAPTCHA_KEY;
  private readonly databaseUrl: string = process.env.DATABASEURL;

  constructor() {
    // Run validation checks outside test environment
    if (process.env.NODE_ENV !== 'test') {
      if (!VALID_ENVIRONMENTS.has(this.env)) {
        // TODO-kev: Prefer the console.error then process exit or throw an error?
        console.error(`Bad environment variable given: ${process.env.ENV}`);
        throw new Error(`Invalid settings: ENV=${process.env.ENV}`);
        process.exit(1);
      }
    }
  }

  public getEnv() {
    return this.env;
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
}

type ConfigNew = {
  nodeEnv: string;

  discord: DiscordConfigType;
  email: EmailConfigType;
  patreon: PatreonConfigType;
  s3: S3ConfigType;
};

export const config: Readonly<ConfigNew> = Object.freeze({
  nodeEnv: process.env.NODE_ENV,

  discord: DiscordConfig,
  email: EmailConfig,
  patreon: PatreonConfig,
  s3: S3Config,
});

export const configOld = new Config();
