import { Queue } from '../queue';

describe('Queue', () => {
  it('adds a socket to the queue when they join', () => {
    const queue = new Queue();

    queue.joinQueue('pronub');

    expect(queue.getQueueSizeUnranked()).toEqual(1);
  });
});
