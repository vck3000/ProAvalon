import { aresetelo } from "../commands/admin/aresetelo";
import User from "../../models/user";
jest.mock('../../models/user');
jest.mock('../../models/modLog');

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
    const mockUsers = [
      {
        _id: 'user1',
        username: 'user1',
        currentRanking: 'oldRanking1',
      },
      {
        _id: 'user2',
        username: 'user2',
        currentRanking: 'oldRanking2',
      },
    ];

    const userFindMock = User.find as jest.MockedFunction<typeof User.find>;
    userFindMock.mockResolvedValue(mockUsers);

    // @ts-ignore
    await aresetelo.run(args, mockSocket);

    expect(User.find).toHaveBeenCalledTimes(1);
    expect(User.find).toHaveBeenCalledWith({});

    expect(mockSocket.emit).toHaveBeenCalledTimes(1);
    expect(mockSocket.emit).toHaveBeenCalledWith('messageCommandReturnStr', {
      message: 'All players rank data has been reset.',
      classStr: 'server-text',
    });
    
    //TODO: I guess we should check that the users were updated, but I'm not sure how to do that.
    
  });
});
