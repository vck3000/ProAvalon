import {
  ReadyPrompt,
  ReadyPromptReplyFromClient,
  ReadyPromptRequestToClient,
} from '../readyPrompt';

// Need to fake timers as we want to assert they fire correctly.
jest.useFakeTimers();

describe('ReadyPrompt', () => {
  let readyPrompt: ReadyPrompt;
  let testSockets: any[] = [];
  const callback = jest.fn();

  beforeEach(() => {
    // Set up test sockets
    testSockets = [];
    for (let i = 1; i <= 6; i++) {
      testSockets.push({
        request: {
          user: {
            username: i.toString(),
          },
        },
        emit: jest.fn(),
      });
    }

    readyPrompt = new ReadyPrompt();
    callback.mockClear();
  });

  it('Sends out prompt on create', () => {
    readyPrompt.createReadyPrompt(testSockets, 'Match found!', callback);
    for (const socket of testSockets) {
      expect(socket.emit).toHaveBeenCalledWith('ready-prompt-to-client', {
        promptId: 0,
        timeout: 10000,
        text: 'Match found!',
      });
    }
  });

  it('Callsback successfully when everyone accepts', () => {
    readyPrompt.createReadyPrompt(testSockets, 'Match found!', callback);

    const clientData: ReadyPromptRequestToClient =
      testSockets[0].emit.mock.calls[0][1];
    const clientReply: ReadyPromptReplyFromClient = {
      promptId: clientData.promptId,
      accept: true,
    };

    expect(callback).not.toHaveBeenCalled();

    for (const socket of testSockets) {
      readyPrompt.clientReply(socket.request.user.username, clientReply);
    }

    expect(callback).toHaveBeenCalledWith(
      true,
      ['1', '2', '3', '4', '5', '6'],
      [],
    );
  });

  it('Callsback successfully only once when some people reject', () => {
    readyPrompt.createReadyPrompt(testSockets, 'Match found!', callback);

    const clientData: ReadyPromptRequestToClient =
      testSockets[0].emit.mock.calls[0][1];
    const clientReply: ReadyPromptReplyFromClient = {
      promptId: clientData.promptId,
      accept: true,
    };

    for (let i = 0; i < testSockets.length; i++) {
      clientReply.accept = i % 2 === 0; // Make every second socket reject
      readyPrompt.clientReply(
        testSockets[i].request.user.username,
        clientReply,
      );
    }

    expect(callback).toHaveBeenCalledWith(
      false,
      ['1', '3', '5'],
      ['2', '4', '6'],
    );
    expect(callback.mock.calls.length).toEqual(1);

    // Timing out doesn't result in another call.
    jest.runAllTimers();
    expect(callback.mock.calls.length).toEqual(1);
  });

  it('Times out', () => {
    readyPrompt.createReadyPrompt(testSockets, 'Match found!', callback);

    const clientData: ReadyPromptRequestToClient =
      testSockets[0].emit.mock.calls[0][1];
    const clientReply: ReadyPromptReplyFromClient = {
      promptId: clientData.promptId,
      accept: true,
    };

    // Take off last one
    testSockets = testSockets.slice(0, -1);
    for (const socket of testSockets) {
      readyPrompt.clientReply(socket.request.user.username, clientReply);
    }

    expect(callback).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(callback).toHaveBeenCalledWith(
      false,
      ['1', '2', '3', '4', '5'],
      ['6'],
    );
  });
});
