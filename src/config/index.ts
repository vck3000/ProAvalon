import { PatreonConfig, PatreonConfigType } from './patreonConfig';
import { DiscordConfig, DiscordConfigType } from './discordConfig';
import { S3Config, S3ConfigType } from './s3Config';
import { EmailConfig, EmailConfigType } from './emailConfig';
import { VpnConfig, VpnConfigType } from './vpnConfig';
import { getRequiredEnvVariable } from './utils';

type ConfigNew = {
  ENV: string;
  NODE_ENV?: string;
  SERVER_DOMAIN?: string;
  PORT?: string;
  IP?: string;
  MY_SECRET_KEY: string;

  GOOGLE_CAPTCHA_KEY?: string;
  DATABASE_URL: string;

  discord: DiscordConfigType;
  email: EmailConfigType;
  patreon: PatreonConfigType;
  s3: S3ConfigType;
  vpn: VpnConfigType;
};

export const config: Readonly<ConfigNew> = Object.freeze({
  ENV: validateEnv(),
  NODE_ENV: process.env.NODE_ENV,
  SERVER_DOMAIN: process.env.SERVER_DOMAIN,
  PORT: process.env.PORT || '3000',
  IP: process.env.IP || '127.0.0.1',
  MY_SECRET_KEY: process.env.MY_SECRET_KEY || 'MySecretKey',

  GOOGLE_CAPTCHA_KEY: process.env.MY_SECRET_GOOGLE_CAPTCHA_KEY,
  DATABASE_URL: getRequiredEnvVariable('DATABASEURL'), // TODO-kev: Consider renaming env variable

  discord: DiscordConfig,
  email: EmailConfig,
  patreon: PatreonConfig,
  s3: S3Config,
  vpn: VpnConfig,
});

function validateEnv() {
  const VALID_ENVIRONMENTS: Set<string> = new Set(['local', 'staging', 'prod']);
  const ENV = getRequiredEnvVariable('ENV');

  if (process.env.NODE_ENV !== 'test') {
    if (!VALID_ENVIRONMENTS.has(ENV)) {
      // TODO-kev: Prefer the console.error then process exit or throw an error?
      console.error(`Bad environment variable given: ${ENV}`);
      throw new Error(`Invalid settings: ENV=${ENV}`);
      process.exit(1);
    }
  }

  return ENV;
}
