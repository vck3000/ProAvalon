const NUM_PLAYERS_PER_GAME = 6;

export class QueueEntry {
  username: string;
  blacklistUsernames: string[]; // Won't be matched into a game with anyone in this list

  constructor(username: string, blacklistUsernames: string[]) {
    this.username = username.toLowerCase();
    this.blacklistUsernames = blacklistUsernames.map((username) =>
      username.toLowerCase(),
    );
  }
}

export class MatchmakingQueue {
  private queue: QueueEntry[] = [];

  private readonly matchFoundCallback: (usernames: string[]) => void;

  constructor(matchFoundCallback: (usernames: string[]) => void) {
    this.matchFoundCallback = matchFoundCallback;
  }

  addUser(queueEntry: QueueEntry): boolean {
    if (this.getQueueUsernames().includes(queueEntry.username)) {
      return false;
    }

    this.queue.push(queueEntry);
    this.checkQueue();

    return true;
  }

  // Returns whether username was removed
  removeUser(username: string): boolean {
    const index = this.getQueueUsernames().indexOf(username.toLowerCase());
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }

    return false;
  }

  getNumInQueue(): number {
    return this.queue.length;
  }

  private checkQueue(): void {
    if (this.queue.length < NUM_PLAYERS_PER_GAME) {
      return;
    }

    // Don't match if a user blacklist collides.
    // Do a brute force search.
    const combinations = MatchmakingQueue.getCombinations(
      this.queue,
      NUM_PLAYERS_PER_GAME,
    );

    for (const combination of combinations) {
      const combinationUsernames = combination.map((entry) => entry.username);
      let combinationFailed = false;

      // For each player entry in the queue, check each player's blacklist.
      for (const entry of combination) {
        const blacklistUsernames = entry.blacklistUsernames;
        for (const blacklistUsername of blacklistUsernames) {
          if (combinationUsernames.includes(blacklistUsername)) {
            combinationFailed = true;
            break;
          }
        }

        if (combinationFailed) {
          break;
        }
      }

      if (!combinationFailed) {
        console.log(`[MatchmakingQueue] Match found: ${combinationUsernames}`);
        this.matchFoundCallback(combinationUsernames);

        // Take out just the matched people from the queue.
        for (const username of combinationUsernames) {
          this.removeUser(username);
        }

        return;
      }
    }
  }

  private getQueueUsernames(): string[] {
    return this.queue.map((entry) => entry.username);
  }

  static getCombinations<T>(array: T[], length: number): T[][] {
    return new Array(1 << array.length)
      .fill(null)
      .map((e1, i) => array.filter((e2, j) => i & (1 << j)))
      .filter((a) => a.length === length);
  }
}
