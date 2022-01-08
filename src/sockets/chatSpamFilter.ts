const SPAM_WINDOW = 5;
const NUM_MESSAGES = 4;

export class ChatSpamFilter {
  history: { [username: string]: number[] };
  seconds: number;

  constructor() {
    this.history = {};
    this.seconds = 0;
  }

  // Returns true if user can chat. Else false.
  chatRequest(username: string): boolean {
    if (!(username in this.history)) {
      this.history[username] = [this.seconds];
    } else {
      const userHistory = this.history[username];
      userHistory.push(this.seconds);
      if (userHistory.length > NUM_MESSAGES) {
        if (userHistory[SPAM_WINDOW - 1] - userHistory[0] < SPAM_WINDOW) {
          userHistory.shift();
          return false;
        }
        userHistory.shift();
      }
    }

    return true;
  }

  // Users of this class must call this every second!
  tick() {
    this.seconds++;
  }

  disconnectUser(username: string): boolean {
    if (username in this.history) {
      delete this.history[username];
      return true;
    }
    return false;
  }
}
