import {
  AllRewards,
  AllRewardsExceptPatreon,
  PatreonRewards,
  RewardType,
} from './indexRewards';

import { isAdmin } from '../modsadmins/admins';
import { isMod } from '../modsadmins/mods';
import { isTO } from '../modsadmins/tournamentOrganizers';
import { isDev } from '../modsadmins/developers';
import { PatreonAgent } from '../clients/patreon/patreonAgent';
import { IUser } from '../gameplay/types';
import { PatreonController } from '../clients/patreon/patreonController';
import constants from './constants';

export async function getPatreonRewardTierForUser(
  usernameLower: string,
): Promise<RewardType> {
  const patreonAgent = new PatreonAgent(new PatreonController());

  const patronDetails = await patreonAgent.findOrUpdateExistingPatronDetails(
    usernameLower,
  );

  if (!patronDetails || !patronDetails.isPledgeActive) {
    return null;
  }

  let highestTierReward: RewardType = null;
  let highestDonationAmount = 0;

  for (const key in PatreonRewards) {
    const reward = AllRewards[key as RewardType];
    if (
      reward.donationReq <= patronDetails.amountCents &&
      reward.donationReq > highestDonationAmount
    ) {
      highestTierReward = key as RewardType;
      highestDonationAmount = reward.donationReq;
    }
  }

  return highestTierReward;
}

export async function getAllRewardsForUser(user: IUser): Promise<RewardType[]> {
  const rewardsSatisfied: RewardType[] = [];
  const patreonReward = await getPatreonRewardTierForUser(
    user.username.toLowerCase(),
  );

  if (patreonReward) {
    rewardsSatisfied.push(patreonReward);
  }

  for (const key in AllRewardsExceptPatreon) {
    const hasReward = await userHasReward(user, key as RewardType);
    if (hasReward === true) {
      rewardsSatisfied.push(key as RewardType);
    }
  }

  return rewardsSatisfied;
}

export async function userHasReward(
  user: IUser,
  rewardType: RewardType,
): Promise<boolean> {
  const reward = AllRewards[rewardType];

  if (reward.adminReq && !isAdmin(user.usernameLower)) {
    return false;
  }

  if (reward.modReq && !isMod(user.usernameLower)) {
    return false;
  }

  if (reward.TOReq && !isTO(user.usernameLower)) {
    return false;
  }

  if (reward.devReq && !isDev(user.usernameLower)) {
    return false;
  }

  // Check for games played
  if (user.totalGamesPlayed < reward.gamesPlayedReq) {
    return false;
  }

  // If we pass all the above, this reward has been satisfied.
  return true;
}

export async function getAvatarLibrarySizeForUser(
  usernameLower: string,
): Promise<number> {
  const patreonReward = await getPatreonRewardTierForUser(usernameLower);

  if (!patreonReward) {
    return 1;
  } else if (patreonReward === constants.TIER1_BADGE) {
    return 2;
  } else if (patreonReward === constants.TIER2_BADGE) {
    return 3;
  } else if (patreonReward === constants.TIER3_BADGE) {
    return 5;
  } else if (patreonReward === constants.TIER4_BADGE) {
    return 10;
  }
}
