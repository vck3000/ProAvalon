import User from '../../models/user';
import { astartnewrankseason } from '../commands/admin/astartnewrankseason';

import {
  getSeasonNumber,
  incrementSeasonNumber,
} from '../../modelsHelper/seasonNumber';

jest.mock('../../models/user');
jest.mock('../../modelsHelper/seasonNumber');

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
    const mockUsers:User[] = [
      {
        _id: 'user1',
        username: 'user1',
        currentRanking: 'oldRanking1',
        // @ts-ignore
        pastRankings: ['test1'],
        markModified: jest.fn(),
        save: jest.fn(),
      },
      {
        _id: 'user2',
        username: 'user2',
        currentRanking: 'oldRanking2',
        // @ts-ignore
        pastRankings: ['test2'],
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

    expect(mockUsers[0].pastRankings[1]).toEqual('oldRanking1');
    expect(mockUsers[1].pastRankings[1]).toEqual('oldRanking2');
    expect(mockUsers[0].currentRanking).toEqual(null);
    expect(mockUsers[1].currentRanking).toEqual(null);
    expect(mockUsers[0].markModified).toHaveBeenCalledWith('pastRankings');
    expect(mockUsers[1].markModified).toHaveBeenCalledWith('pastRankings');
    expect(mockUsers[0].save).toHaveBeenCalled();
    expect(mockUsers[1].save).toHaveBeenCalled();

    expect(getSeasonNumber).toHaveBeenCalled();
    expect(incrementSeasonNumber).toHaveBeenCalled();
  });
});
