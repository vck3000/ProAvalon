import { Queue } from './queue';

const queue = new Queue();
describe('get the queue', () => {
  it('should return an empty queue', () => {
    expect(queue.get()).toEqual([]);
  });

  it('should return all queue members', () => {
    queue.join('test1');
    const date = queue.get()[0]?.joinAt;
    expect(queue.get()).toEqual([
      {
        id: 'test1',
        joinAt: date,
      },
    ]);
  });

  it('should return first 2 members', () => {
    queue.join('test2');
    queue.join('test3');
    const result = queue.getFirstNItems(2);
    const date1 = result[0]?.joinAt;
    const date2 = result[0]?.joinAt;
    expect(result.length).toBe(2);
    expect(result).toEqual([
      {
        id: 'test1',
        joinAt: date1,
      },
      { id: 'test2', joinAt: date2 },
    ]);
  });
});

describe('join the queue', () => {
  it('should return an player test-join ', () => {
    queue.join('test-join');
    const result = queue.get().filter((p) => p.id === 'test-join');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('leave the queue', () => {
  it('should return an player test-join ', () => {
    queue.leave('test-join');
    const result = queue.get().filter((p) => p.id === 'test-join');
    expect(result.length).toBe(0);
  });
});
