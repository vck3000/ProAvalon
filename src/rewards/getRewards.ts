import getPatreonDetails from './getPatreonDetails';
import { Rewards, RewardType } from './indexRewards';
import { isAdmin } from '../modsadmins/admins';
import { isMod } from '../modsadmins/mods';
import { isTO } from '../modsadmins/tournamentOrganizers';
import { isDev } from '../modsadmins/developers';

async function getAllRewardsForUser(user: any): Promise<RewardType[]> {
  const rewardsSatisfied: RewardType[] = [];

  const patreonDetails = await getPatreonDetails(user.patreonId);

  for (const key in Rewards) {
    const hasReward = await userHasReward(
      user,
      key as RewardType,
      patreonDetails,
    );
    if (hasReward === true) {
      rewardsSatisfied.push(key as RewardType);
    }
  }

  return rewardsSatisfied;
}

async function userHasReward(
  user: any,
  rewardType: RewardType,
  patreonDetails?: any,
): Promise<boolean> {
  if (!patreonDetails) {
    patreonDetails = await getPatreonDetails(user.patreonId);
  }

  const reward = Rewards[rewardType];

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

  // Check for patreon donations
  if (
    reward.donationReq !== 0 &&
    // Payment has been declined
    (patreonDetails.declined_since !== null ||
      // Payment is not high enough
      patreonDetails.amount_cents < reward.donationReq ||
      // Username linked is not the current user
      patreonDetails.in_game_username.toLowerCase() !==
        user.username.toLowerCase() ||
      // Passed the 32 day valid period
      new Date() > new Date(patreonDetails.expires))
  ) {
    return false;
  }

  // If we pass all the above, this reward has been satisfied.
  return true;
}

export { userHasReward, getAllRewardsForUser };
