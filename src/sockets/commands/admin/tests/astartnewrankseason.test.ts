import User from '../../../../models/user';
import { astartnewrankseason } from '../astartnewrankseason';

import {
  getSeasonNumber,
  incrementSeasonNumber,
} from '../../../../modelsHelper/seasonNumber';

jest.mock('../../../../models/user');
jest.mock('../../../../models/modLog');
jest.mock('../../../../modelsHelper/seasonNumber');

describe('aresetelo Commands', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls aresetelo', async () => {
    const args = ['/aresetelo'];

    const mockSocket = {
      emit: jest.fn(),
      request: {
        user: {
          username: 'pronub',
        },
      },
    };

    // @ts-ignore
    const mockUsers = [
      {
        _id: 'user1',
        username: 'user1',
        currentRanking: 'oldRanking1',
        // @ts-ignore
        pastRankings: [],
        markModified: jest.fn(),
        save: jest.fn(),
      },
      {
        _id: 'user2',
        username: 'user2',
        currentRanking: 'oldRanking2',
        // @ts-ignore
        pastRankings: [],
        markModified: jest.fn(),
        save: jest.fn(),
      },
    ];

    const userFindMock = User.find as jest.MockedFunction<typeof User.find>;
    userFindMock.mockResolvedValue(mockUsers);

    // @ts-ignore
    await astartnewrankseason.run(args, mockSocket);

    expect(User.find).toHaveBeenCalledTimes(1);
    expect(User.find).toHaveBeenCalledWith({});

    expect(mockSocket.emit).toHaveBeenCalledTimes(1);
    expect(mockSocket.emit).toHaveBeenCalledWith('messageCommandReturnStr', {
      message: 'All players rank data has been reset.',
      classStr: 'server-text',
    });

    //TODO: I guess we should check that the users were updated, but I'm not sure how to do that.
    expect(mockUsers[0].pastRankings[0]).toEqual('oldRanking1');
    expect(mockUsers[0].markModified).toHaveBeenCalledWith('pastRankings');
    expect(mockUsers[0].save).toHaveBeenCalled();

    expect(getSeasonNumber).toHaveBeenCalled();
    expect(incrementSeasonNumber).toHaveBeenCalled();
  });
});
