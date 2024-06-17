export type VpnConfigType = {
  VPN_DETECTION_TOKEN?: string;
  WHITELISTED_VPN_USERNAMES?: string;
};

export const VpnConfig: Readonly<VpnConfigType> = Object.freeze({
  VPN_DETECTION_TOKEN: process.env.VPN_DETECTION_TOKEN,
  WHITELISTED_VPN_USERNAMES: process.env.WHITELISTED_VPN_USERNAMES,
});
