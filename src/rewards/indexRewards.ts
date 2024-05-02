// import { RewardData } from './types';
import ADMIN_BADGE from './allRewards/ADMIN_BADGE';
import CAN_ADD_FORUM from './allRewards/CAN_ADD_FORUM';
import CAN_ALL_CHAT from './allRewards/CAN_ALL_CHAT';
import MOD_BADGE from './allRewards/MOD_BADGE';
import TO_BADGE from './allRewards/TO_BADGE';
import DEV_BADGE from './allRewards/DEV_BADGE';
import TIER1_BADGE from './allRewards/TIER1_BADGE';
import TIER2_BADGE from './allRewards/TIER2_BADGE';
import TIER3_BADGE from './allRewards/TIER3_BADGE';
import TIER4_BADGE from './allRewards/TIER4_BADGE';

export const UserBadgeRewards = {
  ADMIN_BADGE: ADMIN_BADGE,
  MOD_BADGE: MOD_BADGE,
  TO_BADGE: TO_BADGE,
  DEV_BADGE: DEV_BADGE,
};

export const PatreonRewards = {
  TIER1_BADGE: TIER1_BADGE,
  TIER2_BADGE: TIER2_BADGE,
  TIER3_BADGE: TIER3_BADGE,
  TIER4_BADGE: TIER4_BADGE,
};

export const OtherRewards = {
  CAN_ADD_FORUM: CAN_ADD_FORUM,
  CAN_ALL_CHAT: CAN_ALL_CHAT,
};

export const AllRewardsExceptPatreon = {
  ...UserBadgeRewards,
  ...OtherRewards,
};

export const AllRewards = {
  ...UserBadgeRewards,
  ...PatreonRewards,
  ...OtherRewards,
} as const;

export type RewardType = keyof typeof AllRewards;
