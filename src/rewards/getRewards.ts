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

export async function getAllPatreonRewardsForUser(
  usernameLower: string,
): Promise<RewardType[]> {
  const rewardsSatisfied: RewardType[] = [];

  const patreonAgent = new PatreonAgent(new PatreonController());

  const patronDetails = await patreonAgent.findOrUpdateExistingPatronDetails(
    usernameLower,
  );

  if (!patronDetails || !patronDetails.isPledgeActive) {
    return null;
  }

  for (const key in PatreonRewards) {
    const reward = AllRewards[key as RewardType];
    if (reward.donationReq <= patronDetails.amountCents) {
      rewardsSatisfied.push(key as RewardType);
    }
  }

  return rewardsSatisfied;
}

export async function getAllRewardsForUser(user: IUser): Promise<RewardType[]> {
  const rewardsSatisfied: RewardType[] = [];
  const patreonRewards = await getAllPatreonRewardsForUser(
    user.username.toLowerCase(),
  );

  if (patreonRewards) {
    patreonRewards.forEach((reward) => {
      rewardsSatisfied.push(reward);
    });
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
