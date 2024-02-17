const NUM_PLAYERS_PER_GAME = 6;

export class MatchmakingQueue {
  private queue: string[] = [];

  private readonly matchFoundCallback: (usernames: string[]) => void;

  constructor(matchFoundCallback: (usernames: string[]) => void) {
    this.matchFoundCallback = matchFoundCallback;
  }

  addUser(username: string): boolean {
    if (this.queue.includes(username)) {
      return false;
    }

    this.queue.push(username);
    this.checkQueue();

    return true;
  }

  // Returns whether username was removed
  removeUser(username: string): boolean {
    const index = this.queue.indexOf(username);
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
    if (this.queue.length >= NUM_PLAYERS_PER_GAME) {
      console.log(`[MatchmakingQueue] Match found: ${this.queue}`);
      this.matchFoundCallback(this.queue);
      this.queue = [];
    }
  }
}
