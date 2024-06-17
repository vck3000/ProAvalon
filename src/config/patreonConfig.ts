import { getRequiredProdEnvVariable } from './utils';

export type PatreonConfigType = {
  CLIENT_ID?: string;
  CLIENT_SECRET?: string;
  REDIRECT_URL?: string;
};

export const PatreonConfig: Readonly<PatreonConfigType> = Object.freeze({
  CLIENT_ID: getRequiredProdEnvVariable('patreon_client_ID'),
  CLIENT_SECRET: getRequiredProdEnvVariable('patreon_client_secret'),
  REDIRECT_URL: getRequiredProdEnvVariable('patreon_redirectURL'),
});
