const MIN_PLAYERS_PER_GAME = 6;
const MAX_PLAYERS_PER_GAME = 8;

// All in milliseconds
const TEN_SECONDS = 10000;

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
  private queueCheckTimer: NodeJS.Timeout | null = null;

  private readonly matchFoundCallback: (usernames: string[]) => void;

  constructor(matchFoundCallback: (usernames: string[]) => void) {
    this.matchFoundCallback = matchFoundCallback;
  }

  private startQueueCheckTimer() {
    if (this.queueCheckTimer !== null) {
      clearTimeout(this.queueCheckTimer);
    }
    this.queueCheckTimer = setTimeout(() => {
      this.checkQueue();
    }, TEN_SECONDS);
  }

  addUser(queueEntry: QueueEntry): boolean {
    if (this.getQueueUsernames().includes(queueEntry.username)) {
      return false;
    }

    this.queue.push(queueEntry);
    this.startQueueCheckTimer();

    return true;
  }

  // Should only be used when re-adding users who had a match found rejected, so they
  // retain queue priority
  reAddUsersToQueue(queueEntries: QueueEntry[]): boolean {
    for (let i = queueEntries.length - 1; i >= 0; i--) {
      const entry = queueEntries[i];

      if (this.getQueueUsernames().includes(entry.username)) {
        return false;
      }

      this.queue.unshift(entry);
    }

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
    if (this.queue.length < MIN_PLAYERS_PER_GAME) {
      return;
    }

    // Don't match if a user blacklist collides.
    // Do a brute force search.
    for (let i = MAX_PLAYERS_PER_GAME; i >= MIN_PLAYERS_PER_GAME; i--) {
      const combinations = MatchmakingQueue.getCombinations(this.queue, i);

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
          console.log(
            `[MatchmakingQueue] Match found: ${combinationUsernames}`,
          );
          this.matchFoundCallback(combinationUsernames);

          // Take out just the matched people from the queue.
          for (const username of combinationUsernames) {
            this.removeUser(username);
          }

          return;
        }
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
