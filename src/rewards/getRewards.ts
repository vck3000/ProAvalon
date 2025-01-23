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
import { S3Agent } from '../clients/s3/S3Agent';
import S3Controller from '../clients/s3/S3Controller';
import mongoDbAdapter from '../databaseAdapters/mongoose';

const s3Agent = new S3Agent(new S3Controller());
const patreonAgent = new PatreonAgent(new PatreonController());

const TEMP_MIN_LIBRARY_SIZE = 2;

// Returns Patreon Tier for User. Will update the users avatar library based on tier
export async function getAndUpdatePatreonRewardTierForUser(
  usernameLower: string,
): Promise<RewardType> {
  const patreonTier = await getPatreonRewardTierForUser(usernameLower);
  await updateUsersAvatarLibrary(usernameLower, patreonTier);

  return patreonTier;
}

async function getPatreonRewardTierForUser(
  usernameLower: string,
): Promise<RewardType> {
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
  const patreonReward = await getAndUpdatePatreonRewardTierForUser(
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
  patreonReward?: RewardType,
): Promise<number> {
  const defaultLibrarySize = async () => {
    const user = await mongoDbAdapter.user.getUser(usernameLower);
    if (user.totalGamesPlayed > 500) {
      return 2;
    } else if (user.totalGamesPlayed > 100) {
      return 1;
    } else {
      return 0;
    }
  };

  const modLibrarySize = () => {
    return isMod(usernameLower) ? 5 : 0;
  };

  const patreonLibrarySize = async () => {
    if (!patreonReward) {
      patreonReward = await getPatreonRewardTierForUser(usernameLower);
    }

    if (patreonReward === constants.TIER1_BADGE) {
      return 2;
    } else if (patreonReward === constants.TIER2_BADGE) {
      return 3;
    } else if (patreonReward === constants.TIER3_BADGE) {
      return 5;
    } else if (patreonReward === constants.TIER4_BADGE) {
      return 10;
    } else {
      return 0;
    }
  };

  return Math.max(
    await patreonLibrarySize(),
    modLibrarySize(),
    await defaultLibrarySize(),
  );
}

async function updateUsersAvatarLibrary(
  usernameLower: string,
  patreonReward: any,
) {
  const user = await mongoDbAdapter.user.getUser(usernameLower);
  const librarySize = await getAvatarLibrarySizeForUser(
    usernameLower,
    patreonReward,
  );

  if (user.avatarLibrary.length === librarySize) {
    return;
  }

  const approvedAvatarIds = await s3Agent.getApprovedAvatarIdsForUser(
    usernameLower,
  );
  const approvedAvatarIdsNotInLibrary = approvedAvatarIds.filter(
    (id) => !user.avatarLibrary.includes(id),
  );

  if (user.avatarLibrary.length < librarySize) {
    // Add approved avatars until librarySize is reached OR all approvedAvatarIds are added
    const numAvatarsToAdd = Math.min(
      approvedAvatarIdsNotInLibrary.length,
      librarySize - user.avatarLibrary.length,
    );

    user.avatarLibrary.push(
      ...approvedAvatarIdsNotInLibrary.slice(-numAvatarsToAdd),
    );
  } else {
    // Remove oldest avatars
    user.avatarLibrary.splice(0, user.avatarLibrary.length - librarySize);
  }

  user.markModified('avatarLibrary');
  await user.save();
}
