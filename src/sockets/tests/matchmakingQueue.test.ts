import { MatchmakingQueue } from '../matchmakingQueue';

describe('MatchmakingQueue', () => {
  let matchmakingQueue: MatchmakingQueue;
  const matchFoundCallback = jest.fn();

  beforeEach(() => {
    matchmakingQueue = new MatchmakingQueue(matchFoundCallback);
    matchFoundCallback.mockClear();
  });

  it('Matches 6 people in queue', () => {
    for (let i = 1; i <= 5; i++) {
      expect(matchmakingQueue.addUser(i.toString())).toEqual(true);
    }

    expect(matchFoundCallback).not.toHaveBeenCalled();

    matchmakingQueue.addUser('6');
    const expectUsernames = ['1', '2', '3', '4', '5', '6'];
    expect(matchFoundCallback).toHaveBeenCalledWith(expectUsernames);
  });

  it("Doesn't match duplicate usernames", () => {
    for (let i = 1; i <= 5; i++) {
      matchmakingQueue.addUser(i.toString());
    }

    expect(matchFoundCallback).not.toHaveBeenCalled();

    matchmakingQueue.addUser('5');
    expect(matchFoundCallback).not.toHaveBeenCalled();

    matchmakingQueue.addUser('6');
    const expectUsernames = ['1', '2', '3', '4', '5', '6'];
    expect(matchFoundCallback).toHaveBeenCalledWith(expectUsernames);
  });

  it('Matches multiple times fine', () => {
    for (let i = 1; i <= 12; i++) {
      matchmakingQueue.addUser(i.toString());
    }

    {
      const expectUsernames = ['1', '2', '3', '4', '5', '6'];
      expect(matchFoundCallback).toHaveBeenCalledWith(expectUsernames);
    }
    {
      const expectUsernames = ['7', '8', '9', '10', '11', '12'];
      expect(matchFoundCallback).toHaveBeenCalledWith(expectUsernames);
    }
  });

  it('Can remove users', () => {
    for (let i = 1; i <= 5; i++) {
      matchmakingQueue.addUser(i.toString());
    }

    expect(matchmakingQueue.removeUser('1')).toEqual(true);
    matchmakingQueue.addUser('6');

    expect(matchFoundCallback).not.toHaveBeenCalled();

    matchmakingQueue.addUser('1');
    const expectUsernames = ['2', '3', '4', '5', '6', '1'];
    expect(matchFoundCallback).toHaveBeenCalledWith(expectUsernames);
  });

  it('removeUser returns correctly', () => {
    expect(matchmakingQueue.removeUser('1')).toEqual(false);

    matchmakingQueue.addUser('1');
    expect(matchmakingQueue.removeUser('1')).toEqual(true);

    expect(matchmakingQueue.removeUser('1')).toEqual(false);
  });
});
