import { Queue } from '../queue';

describe('Queue', () => {
  it('adds a socket to the queue when they join', () => {
    const queue = new Queue();

    queue.joinUnrankedQueue('pronub');
    queue.joinRankedQueue('pronub');
    expect(queue.getQueueSizeUnranked()).toEqual(1);
    expect(queue.getQueueSizeRanked()).toEqual(1);
  });

  it('remove a username from the queue', () => {
    const queue = new Queue();

    queue.joinUnrankedQueue('pronub');
    queue.joinRankedQueue('pronub');

    queue.leaveUnrankedQueue('pronub');
    queue.leaveRankedQueue('pronub');
    expect(queue.getQueueSizeUnranked()).toEqual(0);
    expect(queue.getQueueSizeRanked()).toEqual(0);
  });
});
