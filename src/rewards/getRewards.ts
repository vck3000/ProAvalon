import PatreonId from '../models/patreonId';
import { Rewards, RewardType } from './indexRewards';

import { isMod } from '../modsadmins/mods';
import { isAdmin } from '../modsadmins/admins';

async function getAllRewardsForUser(user: any): Promise<RewardType[]> {
  const rewardsSatisfied: RewardType[] = [];

  const patreonDetails = await getPatreonDetails(user.patreonId);

  for (const key in Rewards) {
    const hasReward = await userHasReward(
      user,
      key as RewardType,
      patreonDetails
    );
    if (hasReward === true) {
      rewardsSatisfied.push(key as RewardType);
    }
  }

  // console.log(`${user.username} has the following rewards:`);
  // console.log(rewardsSatisfied);
  return rewardsSatisfied;
}

async function userHasReward(
  user: any,
  rewardType: RewardType,
  patreonDetails?: any
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

async function getPatreonDetails(patreonId: string) {
  let patreonDetails: any;

  await PatreonId.find({ id: patreonId })
    .exec()
    .then((obj) => {
      patreonDetails = obj;
      // console.log('Gotten patreon details.');
    })
    .catch((err) => {
      console.log(err);
    });

  return patreonDetails;
}

export { userHasReward, getAllRewardsForUser };
