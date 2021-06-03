jest.mock('../myFunctions/IPLinkedAccounts', () => {
  return jest.fn(async () => {
    return {
      linkedUsernamesWithLevel: ['pronub', 'asdf'],
      usernamesTree: 'pronub\nasdf',

      linkedUsernames: ['pronub', 'asdf'],
      linkedIPs: ['127.0.0.1'],
      target: 'pronub',
    };
  });
});

jest.mock('../models/modLog', () => {
  return {
    create: jest.fn(),
  };
});

jest.mock('../models/user', () => {
  return {
    findOne: jest.fn(async () => {
      return {
        id: '123',
        username: 'Qwer',
        usernameLower: 'qwer',
      };
    }),
  };
});

const sockets = require('./sockets.js');

const IPLinkedAccounts = require('../myFunctions/IPLinkedAccounts');
const ModLog = require('../models/modLog');
const User = require('../models/user');

const modCommands = sockets.actionsObj.modCommands;

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
  });

  // it.only('creates a mod log', () => {
  //   const data = { args: ['/miplinkedaccs', 'ProNub', '5'] };

  //   modCommands.miplinkedaccs.run(data, mockSocket);

  //   expect(ModLog.create).toHaveBeenCalledWith('ProNub', 5);
  // });

  it('calls iplinkedaccs', () => {
    const data = { args: ['/miplinkedaccs', 'ProNub', '2'] };

    modCommands.miplinkedaccs.run(data, mockSocket);

    expect(IPLinkedAccounts).toHaveBeenCalledWith('ProNub', 2);
  });

  it('defaults to level of 2', () => {
    const data = { args: ['/miplinkedaccs', 'ProNub'] };

    modCommands.miplinkedaccs.run(data, mockSocket);

    expect(IPLinkedAccounts).toHaveBeenCalledWith('ProNub', 2);
  });

  it('Errors on bad number of levels', () => {
    const data = { args: ['/miplinkedaccs', 'ProNub', '-1'] };

    modCommands.miplinkedaccs.run(data, mockSocket);

    expect(mockSocket.emit.mock.calls[0][0]).toEqual('messageCommandReturnStr');
    expect(mockSocket.emit.mock.calls[0][1][0]).toEqual(
      expect.objectContaining({
        classStr: 'server-text',
        message: '-1 is not a valid integer.',
      })
    );
  });

  it('defaults to level 2 if non-int was given as level', () => {
    const data = { args: ['/miplinkedaccs', 'ProNub', 'asdf'] };

    modCommands.miplinkedaccs.run(data, mockSocket);

    expect(IPLinkedAccounts).toHaveBeenCalledWith('ProNub', 2);
  });
});
