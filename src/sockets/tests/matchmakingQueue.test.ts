import { MatchmakingQueue, GetSocketFunc, Socket } from '../matchmakingQueue';

const sockets: { [username: string]: Socket } = {
  one: {
    emit: jest.fn(),
  },
  two: {
    emit: jest.fn(),
  },
  three: {
    emit: jest.fn(),
  },
  four: {
    emit: jest.fn(),
  },
  five: {
    emit: jest.fn(),
  },
  six: {
    emit: jest.fn(),
  },
};

const MockGetSocketFunc: GetSocketFunc = (username: string) => {
  return sockets[username];
};

describe('Queue', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  // it('adds a socket to the queue when they join', () => {
  //   const queue = new MatchmakingQueue(null, null);

  //   queue.joinUnrankedQueue('pronub');
  //   queue.joinRankedQueue('pronub');
  //   expect(queue.getQueueSizeUnranked()).toEqual(1);
  //   expect(queue.getQueueSizeRanked()).toEqual(1);
  // });

  // it('remove a username from the queue', () => {
  //   const queue = new MatchmakingQueue(null, null);

  //   queue.joinUnrankedQueue('pronub');
  //   queue.joinRankedQueue('pronub');

  //   queue.leaveUnrankedQueue('pronub');
  //   queue.leaveRankedQueue('pronub');
  //   expect(queue.getQueueSizeUnranked()).toEqual(0);
  //   expect(queue.getQueueSizeRanked()).toEqual(0);
  // });

  it('sends joinRoom emit message to socket', () => {
    const queue = new MatchmakingQueue(MockGetSocketFunc, null);

    queue.joinUnrankedQueue('one');
    queue.joinUnrankedQueue('two');
    queue.joinUnrankedQueue('three');
    queue.joinUnrankedQueue('four');
    queue.joinUnrankedQueue('five');
    queue.joinUnrankedQueue('six');

    expect(sockets['one'].emit).toHaveBeenCalledWith('joinRoom', { roomId: 1 });
  });
});
