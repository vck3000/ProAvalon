export type PatreonConfigType = {
  patreonClientId: string;
  patreonClientSecret: string;
  patreonRedirectUrl: string;
};

export const PatreonConfig: Readonly<PatreonConfigType> = Object.freeze({
  patreonClientId: process.env.patreon_client_ID,
  patreonClientSecret: process.env.patreon_client_secret,
  patreonRedirectUrl: process.env.patreon_redirectURL,
});
