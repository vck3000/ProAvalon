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
  PORT?: number;
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
  PORT: validatePort(),
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

function validateEnv(): string {
  const VALID_ENVIRONMENTS: Set<string> = new Set(['local', 'staging', 'prod']);
  const ENV = getRequiredEnvVariable('ENV');

  if (process.env.NODE_ENV !== 'test') {
    if (!VALID_ENVIRONMENTS.has(ENV)) {
      console.error(`Bad environment variable given: ${ENV}`);
      process.exit(1);
    }
  }

  return ENV;
}

function validatePort(): number {
  if (!process.env.PORT) {
    return 3000;
  }

  const port = parseInt(process.env.PORT, 10);

  if (isNaN(port) || port < 1 || port > 65535) {
    console.error(
      `Invalid port number: ${port}. Port must be between 1 and 65535.`,
    );
  }

  return port;
}
