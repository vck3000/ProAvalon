import { userHasReward } from '../getRewards';
import constants from '../constants';

const patreonDetails = {};
const user = {
  username: 'ProNub',
  totalGamesPlayed: 150,
};

describe('User has reward', () => {
  it('correctly determines user has admin badge', async () => {
    const hasReward = await userHasReward(
      user,
      constants.ADMIN_BADGE,
      patreonDetails
    );

    expect(hasReward).toBe(true);
  });

  it('correctly determines user has mod badge', async () => {
    const hasReward = await userHasReward(
      user,
      constants.MOD_BADGE,
      patreonDetails
    );

    expect(hasReward).toBe(true);
  });

  it('correctly determines user can all chat', async () => {
    const hasReward = await userHasReward(
      user,
      constants.CAN_ALL_CHAT,
      patreonDetails
    );

    expect(hasReward).toBe(true);
  });

  it('correctly determines user cannot all chat', async () => {
    const newUser = {
      ...user,
      totalGamesPlayed: 1,
    };

    const hasReward = await userHasReward(
      newUser,
      constants.CAN_ALL_CHAT,
      patreonDetails
    );

    expect(hasReward).toBe(false);
  });

  it('correctly determines user can post to forums', async () => {
    const hasReward = await userHasReward(
      user,
      constants.CAN_ADD_FORUM,
      patreonDetails
    );

    expect(hasReward).toBe(true);
  });

  it('correctly determines user cannot post to forums', async () => {
    const newUser = {
      ...user,
      totalGamesPlayed: 1,
    };

    const hasReward = await userHasReward(
      newUser,
      constants.CAN_ADD_FORUM,
      patreonDetails
    );

    expect(hasReward).toBe(false);
  });
});
