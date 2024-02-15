export class MatchmakingQueue {
  private queue: string[] = [];

  private readonly matchFoundCallback: (usernames: string[]) => void;

  constructor(matchFoundCallback: (usernames: string[]) => void) {
    this.matchFoundCallback = matchFoundCallback;
  }

  addUser(username: string): void {
    if (!this.queue.includes(username)) {
      this.queue.push(username);
    }

    this.checkQueue();
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

  private checkQueue(): void {
    if (this.queue.length >= 6) {
      console.log(`[MatchmakingQueue] Match found: ${this.queue}`);
      this.matchFoundCallback(this.queue);
      this.queue = [];
    }
  }
}
