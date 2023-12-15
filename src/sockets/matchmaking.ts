export type MatchFoundCallback = (users: string[]) => void;

export class Matchmaking {
  private userQueue: string[];
  matchFoundCallback: MatchFoundCallback;

  constructor(matchFoundCallback: MatchFoundCallback) {
    this.userQueue = [];
    this.matchFoundCallback = matchFoundCallback;
  }

  // Add user to queue
  addUserToQueue(username: string): void {
    if (!(username in this.userQueue)) {
      this.userQueue.push(username);
    }

    this.checkRoomPossible(6);
  }

  // Remove user from queue
  removeUser(username: string): void {
    const index = this.userQueue.indexOf(username);
    if (index !== -1) {
      this.userQueue.splice(index, 1);
    }
  }

  // Checks if number users in queue >= specified roomSize.
  // If yes, returns the list of users and removes them from the queue.
  // If < specified roomSize, returns null
  private checkRoomPossible(roomSize: number): void {
    if (this.userQueue.length >= roomSize) {
      const users = this.userQueue.slice(0, roomSize);
      this.userQueue = this.userQueue.slice(roomSize);

      this.matchFoundCallback(users);
    }
  }
}
