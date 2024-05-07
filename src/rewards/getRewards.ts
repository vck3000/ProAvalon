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
import { patreonAgent } from '../clients/patreon/patreonAgent';
import User from '../models/user';
import { IUser } from '../gameplay/types';

export async function getAllPatreonRewardsForUser(
  usernameLower: string,
): Promise<RewardType[]> {
  const rewardsSatisfied: RewardType[] = [];

  const patronDetails = await patreonAgent.getExistingPatronDetails(
    usernameLower,
  );

  if (!patronDetails || !patronDetails.isActivePatron) {
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

async function getAllRewardsForUser(user: IUser): Promise<RewardType[]> {
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

async function userHasReward(
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

export { userHasReward, getAllRewardsForUser };
