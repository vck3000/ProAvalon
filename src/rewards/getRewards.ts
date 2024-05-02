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
import { patreonAgent } from './patreonAgent';

export async function getAllPatreonRewardsForUser(usernameLower: string) {
  const rewardsSatisfied: RewardType[] = [];

  const patreonDetails = await patreonAgent.getExistingPatreonDetails(
    usernameLower,
  );

  if (!patreonDetails || !patreonDetails.isActivePatreon) {
    return null;
  }

  for (const key in PatreonRewards) {
    const reward = AllRewards[key as RewardType];
    if (reward.donationReq <= patreonDetails.amountCents) {
      rewardsSatisfied.push(key as RewardType);
    }
  }

  return rewardsSatisfied;
}

async function getAllRewardsForUser(
  usernameLower: string,
  totalGamesPlayed: number,
): Promise<RewardType[]> {
  const rewardsSatisfied: RewardType[] = [];
  const patreonRewards = await getAllPatreonRewardsForUser(usernameLower);

  patreonRewards.forEach((reward) => {
    rewardsSatisfied.push(reward);
  });

  for (const key in AllRewardsExceptPatreon) {
    const hasReward = await userHasReward(
      usernameLower,
      totalGamesPlayed,
      key as RewardType,
    );
    if (hasReward === true) {
      rewardsSatisfied.push(key as RewardType);
    }
  }

  return rewardsSatisfied;
}

async function userHasReward(
  usernameLower: string,
  totalGamesPlayed: number,
  rewardType: RewardType,
): Promise<boolean> {
  const reward = AllRewards[rewardType];

  if (reward.adminReq && !isAdmin(usernameLower)) {
    return false;
  }

  if (reward.modReq && !isMod(usernameLower)) {
    return false;
  }

  if (reward.TOReq && !isTO(usernameLower)) {
    return false;
  }

  if (reward.devReq && !isDev(usernameLower)) {
    return false;
  }

  // Check for games played
  if (totalGamesPlayed < reward.gamesPlayedReq) {
    return false;
  }

  // If we pass all the above, this reward has been satisfied.
  return true;
}

export { userHasReward, getAllRewardsForUser };
