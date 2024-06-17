export type PatreonConfigType = {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
};

export const PatreonConfig: Readonly<PatreonConfigType> = Object.freeze({
  clientId: process.env.patreon_client_ID,
  clientSecret: process.env.patreon_client_secret,
  redirectUrl: process.env.patreon_redirectURL,
});
