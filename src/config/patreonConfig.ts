export type PatreonConfigType = {
  CLIENT_ID?: string;
  CLIENT_SECRET?: string;
  REDIRECT_URL?: string;
};

export const PatreonConfig: Readonly<PatreonConfigType> = Object.freeze({
  CLIENT_ID: process.env.patreon_client_ID,
  CLIENT_SECRET: process.env.patreon_client_secret,
  REDIRECT_URL: process.env.patreon_redirectURL,
});
