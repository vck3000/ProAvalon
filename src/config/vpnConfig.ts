import { getRequiredProdEnvVariable } from './utils';

export type VpnConfigType = {
  VPN_DETECTION_TOKEN?: string;
  WHITELISTED_VPN_USERNAMES?: string;
};

export const VpnConfig: Readonly<VpnConfigType> = Object.freeze({
  VPN_DETECTION_TOKEN: getRequiredProdEnvVariable('VPN_DETECTION_TOKEN'),
  WHITELISTED_VPN_USERNAMES: getRequiredProdEnvVariable(
    'WHITELISTED_VPN_USERNAMES',
  ),
});
