import { MatchmakingQueue, QueueEntry } from '../matchmakingQueue';

const MM_JOIN_WINDOW = 10000;

// Need to fake timers as we want to assert the queue waits for new users
jest.useFakeTimers();

describe('MatchmakingQueue', () => {
  let matchmakingQueue: MatchmakingQueue;
  const matchFoundCallback = jest.fn();

  beforeEach(() => {
    matchmakingQueue = new MatchmakingQueue(matchFoundCallback);
    matchFoundCallback.mockClear();
  });

  const getDefaultQueueEntry = (username: string): QueueEntry => {
    return new QueueEntry(username, []);
  };

  it('Matches 6 people in queue', () => {
    for (let i = 1; i <= 5; i++) {
      expect(
        matchmakingQueue.addUser(getDefaultQueueEntry(i.toString())),
      ).toEqual(true);
      expect(matchmakingQueue.getNumInQueue()).toEqual(i);
    }

    expect(matchFoundCallback).not.toHaveBeenCalled();

    matchmakingQueue.addUser(getDefaultQueueEntry('6'));

    jest.advanceTimersByTime(MM_JOIN_WINDOW);

    const expectUsernames = ['1', '2', '3', '4', '5', '6'];
    expect(matchFoundCallback).toHaveBeenCalledWith(expectUsernames);
    expect(matchmakingQueue.getNumInQueue()).toEqual(0);
  });

  it('Matches 7 people in queue', () => {
    for (let i = 1; i <= 5; i++) {
      expect(
        matchmakingQueue.addUser(getDefaultQueueEntry(i.toString())),
      ).toEqual(true);
      expect(matchmakingQueue.getNumInQueue()).toEqual(i);
    }

    expect(matchFoundCallback).not.toHaveBeenCalled();

    matchmakingQueue.addUser(getDefaultQueueEntry('6'));
    matchmakingQueue.addUser(getDefaultQueueEntry('7'));

    const expectUsernames = ['1', '2', '3', '4', '5', '6'];
    expect(matchFoundCallback).toHaveBeenCalledWith(expectUsernames);
    expect(matchmakingQueue.getNumInQueue()).toEqual(1);
  });

  it('Adds and removes a player username case insensitive', () => {
    matchmakingQueue.addUser(getDefaultQueueEntry('ProNub'));
    expect(matchmakingQueue.getNumInQueue()).toEqual(1);
    matchmakingQueue.removeUser('ProNub');
    expect(matchmakingQueue.getNumInQueue()).toEqual(0);
  });

  it("Doesn't match duplicate usernames", () => {
    for (let i = 1; i <= 5; i++) {
      matchmakingQueue.addUser(getDefaultQueueEntry(i.toString()));
    }

    expect(matchFoundCallback).not.toHaveBeenCalled();

    matchmakingQueue.addUser(getDefaultQueueEntry('5'));
    expect(matchFoundCallback).not.toHaveBeenCalled();

    matchmakingQueue.addUser(getDefaultQueueEntry('6'));
    jest.advanceTimersByTime(MM_JOIN_WINDOW);

    const expectUsernames = ['1', '2', '3', '4', '5', '6'];
    expect(matchFoundCallback).toHaveBeenCalledWith(expectUsernames);
  });

  it('Matches multiple times fine', () => {
    for (let i = 1; i <= 12; i++) {
      matchmakingQueue.addUser(getDefaultQueueEntry(i.toString()));
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
      matchmakingQueue.addUser(getDefaultQueueEntry(i.toString()));
    }

    expect(matchmakingQueue.removeUser('1')).toEqual(true);
    matchmakingQueue.addUser(getDefaultQueueEntry('6'));

    expect(matchFoundCallback).not.toHaveBeenCalled();

    matchmakingQueue.addUser(getDefaultQueueEntry('1'));

    jest.advanceTimersByTime(MM_JOIN_WINDOW);

    const expectUsernames = ['2', '3', '4', '5', '6', '1'];
    expect(matchFoundCallback).toHaveBeenCalledWith(expectUsernames);
  });

  it('removeUser returns correctly', () => {
    expect(matchmakingQueue.removeUser('1')).toEqual(false);

    matchmakingQueue.addUser(getDefaultQueueEntry('1'));
    expect(matchmakingQueue.removeUser('1')).toEqual(true);

    expect(matchmakingQueue.removeUser('1')).toEqual(false);
  });

  describe('Blacklists', () => {
    it('Simple', () => {
      for (let i = 1; i <= 5; i++) {
        matchmakingQueue.addUser(getDefaultQueueEntry(i.toString()));
      }

      // 6th user doesn't like player 3 and 12.
      matchmakingQueue.addUser(new QueueEntry('6', ['3', '12']));
      jest.advanceTimersByTime(MM_JOIN_WINDOW);

      expect(matchFoundCallback).not.toHaveBeenCalled();

      // 7th user can match.
      matchmakingQueue.addUser(getDefaultQueueEntry('7'));
      jest.advanceTimersByTime(MM_JOIN_WINDOW);

      const expectUsernames = ['1', '2', '3', '4', '5', '7'];
      expect(matchFoundCallback).toHaveBeenCalledWith(expectUsernames);

      // Add players 8 to 11 (4 players, so now 5 in queue)
      for (let i = 8; i < 8 + 4; i++) {
        matchmakingQueue.addUser(getDefaultQueueEntry(i.toString()));
      }

      // Player 12 doesn't like a lot of people so doesn't match into anyone.
      matchmakingQueue.addUser(new QueueEntry('12', ['8', '9', '10']));

      // Player 13 comes in. Gets matched.
      matchmakingQueue.addUser(getDefaultQueueEntry('13'));

      jest.advanceTimersByTime(MM_JOIN_WINDOW);

      {
        const expectUsernames = ['6', '8', '9', '10', '11', '13'];
        expect(matchFoundCallback).toHaveBeenCalledWith(expectUsernames);
      }

      // One player left in (player 12)
      expect(matchmakingQueue.getNumInQueue()).toEqual(1);
    });

    it('Ignores casing', () => {
      matchmakingQueue.addUser(new QueueEntry('ProNub', ['AsDf']));
      matchmakingQueue.addUser(new QueueEntry('ASDF', ['PRONUB', 'QWER', '1']));
      matchmakingQueue.addUser(getDefaultQueueEntry('QWER'));

      matchmakingQueue.addUser(getDefaultQueueEntry('1'));
      matchmakingQueue.addUser(getDefaultQueueEntry('2'));
      matchmakingQueue.addUser(getDefaultQueueEntry('3'));
      matchmakingQueue.addUser(getDefaultQueueEntry('4'));

      jest.advanceTimersByTime(MM_JOIN_WINDOW);
      const expectUsernames = ['pronub', 'qwer', '1', '2', '3', '4'];
      expect(matchFoundCallback).toHaveBeenCalledWith(expectUsernames);
    });

    it('ReAdd users', () => {
      matchmakingQueue.reAddUsersToQueue([
        new QueueEntry('pronub', []),
        new QueueEntry('1', []),
        new QueueEntry('2', []),
        new QueueEntry('3', []),
        new QueueEntry('4', []),
        new QueueEntry('5', []),
      ]);

      const expectUsernames = ['pronub', '1', '2', '3', '4', '5'];
      expect(matchFoundCallback).toHaveBeenCalledWith(expectUsernames);
    });
  });

  describe('GetCombinations', () => {
    it('Simple 1', () => {
      const combinations = MatchmakingQueue.getCombinations(
        ['1', '2', '3', '4', '5', '6', '7'],
        6,
      );

      const expected = [
        ['1', '2', '3', '4', '5', '6'],
        ['1', '2', '3', '4', '5', '7'],
        ['1', '2', '3', '4', '6', '7'],
        ['1', '2', '3', '5', '6', '7'],
        ['1', '2', '4', '5', '6', '7'],
        ['1', '3', '4', '5', '6', '7'],
        ['2', '3', '4', '5', '6', '7'],
      ];

      expect(combinations).toEqual(expected);
    });

    it('Simple 2', () => {
      const combinations = MatchmakingQueue.getCombinations(
        ['1', '2', '3', '4', '5', '6', '7', '8'],
        6,
      );

      const expected = [
        ['1', '2', '3', '4', '5', '6'],
        ['1', '2', '3', '4', '5', '7'],
        ['1', '2', '3', '4', '6', '7'],
        ['1', '2', '3', '5', '6', '7'],
        ['1', '2', '4', '5', '6', '7'],
        ['1', '3', '4', '5', '6', '7'],
        ['2', '3', '4', '5', '6', '7'],
        ['1', '2', '3', '4', '5', '8'],
        ['1', '2', '3', '4', '6', '8'],
        ['1', '2', '3', '5', '6', '8'],
        ['1', '2', '4', '5', '6', '8'],
        ['1', '3', '4', '5', '6', '8'],
        ['2', '3', '4', '5', '6', '8'],
        ['1', '2', '3', '4', '7', '8'],
        ['1', '2', '3', '5', '7', '8'],
        ['1', '2', '4', '5', '7', '8'],
        ['1', '3', '4', '5', '7', '8'],
        ['2', '3', '4', '5', '7', '8'],
        ['1', '2', '3', '6', '7', '8'],
        ['1', '2', '4', '6', '7', '8'],
        ['1', '3', '4', '6', '7', '8'],
        ['2', '3', '4', '6', '7', '8'],
        ['1', '2', '5', '6', '7', '8'],
        ['1', '3', '5', '6', '7', '8'],
        ['2', '3', '5', '6', '7', '8'],
        ['1', '4', '5', '6', '7', '8'],
        ['2', '4', '5', '6', '7', '8'],
        ['3', '4', '5', '6', '7', '8'],
      ];

      expect(combinations).toEqual(expected);
    });

    it('Ask for more combinations than the length of given array', () => {
      const combinations = MatchmakingQueue.getCombinations(
        ['1', '2', '3', '4', '5', '6'],
        8,
      );

      const expected: string[] = [];

      expect(combinations).toEqual(expected);
    });
  });
});
