// @ts-nocheck

import IPLinkedAccounts from '../../myFunctions/IPLinkedAccounts';
import { miplinkedaccs } from '../commands/mod/miplinkedaccs';

jest.mock('../../myFunctions/IPLinkedAccounts');
jest.mock('../../models/modLog');
jest.mock('../../models/user');

describe('ModCommands', () => {
  const mockSocket = {
    emit: jest.fn(),
    request: {
      user: {
        username: 'Qwer',
      },
    },
  };

  beforeEach(() => {
    mockSocket.emit.mockReset();
    // ModLog.create.mockReset();

    // @ts-ignore
    IPLinkedAccounts.mockReset();
  });

  // it.only('creates a mod log', () => {
  //   const data = { args: ['/miplinkedaccs', 'ProNub', '5'] };

  //   modCommands.miplinkedaccs.run(data, mockSocket);

  //   expect(ModLog.create).toHaveBeenCalledWith('ProNub', 5);
  // });

  it('calls iplinkedaccs', () => {
    const args = ['/miplinkedaccs', 'ProNub', '2'];

    miplinkedaccs.run(args, mockSocket);

    expect(IPLinkedAccounts).toHaveBeenCalledWith('ProNub', 2);
  });

  it('defaults to level of 1', () => {
    const args = ['/miplinkedaccs', 'ProNub'];

    miplinkedaccs.run(args, mockSocket);

    expect(IPLinkedAccounts).toHaveBeenCalledWith('ProNub', 1);
  });

  it('errors on bad number of levels', () => {
    const args = ['/miplinkedaccs', 'ProNub', '-1'];

    miplinkedaccs.run(args, mockSocket);

    expect(mockSocket.emit.mock.calls[0][0]).toEqual('messageCommandReturnStr');
    expect(mockSocket.emit.mock.calls[0][1][0]).toEqual(
      expect.objectContaining({
        classStr: 'server-text',
        message: '-1 is not a valid positive integer.',
      }),
    );
  });

  it('disallows non-integer depths', () => {
    const args = ['/miplinkedaccs', 'ProNub', 'asdf'];

    miplinkedaccs.run(args, mockSocket);

    expect(mockSocket.emit.mock.calls[0][0]).toEqual('messageCommandReturnStr');
    expect(mockSocket.emit.mock.calls[0][1][0]).toEqual(
      expect.objectContaining({
        classStr: 'server-text',
        message: 'asdf is not a valid positive integer.',
      }),
    );

    expect(IPLinkedAccounts).not.toHaveBeenCalled();
  });
});
