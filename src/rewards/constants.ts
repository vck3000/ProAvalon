import { Role } from '../gameplay/roles/types';

const constants = {
  ADMIN_BADGE: 'ADMIN_BADGE',
  MOD_BADGE: 'MOD_BADGE',
  TO_BADGE: 'TO_BADGE',
  DEV_BADGE: 'DEV_BADGE',
  TIER1_BADGE: 'TIER1_BADGE',
  TIER2_BADGE: 'TIER2_BADGE',
  TIER3_BADGE: 'TIER3_BADGE',
  TIER4_BADGE: 'TIER4_BADGE',
  CAN_ALL_CHAT: 'CAN_ALL_CHAT',
  CAN_ADD_FORUM: 'CAN_ADD_FORUM',

  tier1_donation: 200,
  tier2_donation: 500,
  tier3_donation: 1000,
  tier4_donation: 3000,

  tier1: 'VT',
  tier2: 'Lovers',
  tier3: Role.Percival,
  tier4: Role.Merlin,
} as const;

export function getNumAvatarsForPatreonTier(cents: number): number {
  if (cents === 0) {
    return 1;
  } else if (cents <= constants.tier1_donation) {
    return 2;
  } else if (cents <= constants.tier2_donation) {
    return 3;
  } else if (cents <= constants.tier3_donation) {
    return 5;
  } else if (cents <= constants.tier4_donation) {
    return 10;
  } else {
    return 10;
  }
}

export default constants;
