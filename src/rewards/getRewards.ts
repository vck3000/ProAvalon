import { AllRewards, PatreonRewards, RewardType } from './indexRewards';

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

async function getAllRewardsForUser(user: any): Promise<RewardType[]> {
  const rewardsSatisfied: RewardType[] = [];
  const patreonRewards = await getAllPatreonRewardsForUser(
    user.username.toLowercase(),
  );
  rewardsSatisfied.concat(patreonRewards);

  for (const key in AllRewards) {
    const hasReward = await userHasReward(user, key as RewardType);
    if (hasReward === true) {
      rewardsSatisfied.push(key as RewardType);
    }
  }

  return rewardsSatisfied;
}

async function userHasReward(
  user: any,
  rewardType: RewardType,
): Promise<boolean> {
  const reward = AllRewards[rewardType];

  if (reward.adminReq && !isAdmin(user.username)) {
    return false;
  }

  if (reward.modReq && !isMod(user.username)) {
    return false;
  }

  if (reward.TOReq && !isTO(user.username)) {
    return false;
  }

  if (reward.devReq && !isDev(user.username)) {
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
