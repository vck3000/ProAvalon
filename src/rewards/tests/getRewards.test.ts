import { getAllRewardsForUser, userHasReward } from '../getRewards';
import constants from '../constants';

jest.mock('../getPatreonDetails', () => () => ({
  declined_since: 0,
}));

const adminUser = {
  username: 'ProNub',
  totalGamesPlayed: 150,
};

const newUser = {
  username: 'asdf',
  totalGamesPlayed: 1,
};

const normalUser = {
  username: 'qwer',
  totalGamesPlayed: 50,
};

describe('getAllRewardsForUser()', () => {
  it('correctly returns all rewards a user has', async () => {
    const inputOutputs = [
      [
        adminUser,
        [
          constants.ADMIN_BADGE,
          constants.CAN_ADD_FORUM,
          constants.CAN_ALL_CHAT,
          constants.MOD_BADGE,
        ],
      ],
      [newUser, []],
      [normalUser, [constants.CAN_ADD_FORUM, constants.CAN_ALL_CHAT]],
    ];

    for (const [user, exp] of inputOutputs) {
      const rewards = await getAllRewardsForUser(user);

      expect(rewards).toEqual(exp);
    }
  });
});

describe('userHasReward()', () => {
  it('correctly determines user has admin badge', async () => {
    const inputOutputs = [
      [adminUser, true],
      [newUser, false],
    ];

    for (const [user, exp] of inputOutputs) {
      const hasReward = await userHasReward(user, constants.ADMIN_BADGE);

      expect(hasReward).toBe(exp);
    }
  });

  it('correctly determines user has mod badge', async () => {
    const inputOutputs = [
      [adminUser, true],
      [newUser, false],
    ];

    for (const [user, exp] of inputOutputs) {
      const hasReward = await userHasReward(user, constants.MOD_BADGE);

      expect(hasReward).toBe(exp);
    }
  });

  it('correctly determines user can all chat', async () => {
    const inputOutputs = [
      [adminUser, true],
      [newUser, false],
    ];

    for (const [user, exp] of inputOutputs) {
      const hasReward = await userHasReward(user, constants.CAN_ALL_CHAT);

      expect(hasReward).toBe(exp);
    }
  });

  it('correctly determines user can post to forums', async () => {
    const inputOutputs = [
      [adminUser, true],
      [newUser, false],
    ];

    for (const [user, exp] of inputOutputs) {
      const hasReward = await userHasReward(user, constants.CAN_ADD_FORUM);

      expect(hasReward).toBe(exp);
    }
  });
});
