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

      // Ishan logic
      if (userHistory.length > 4) {
      }
    }

    return true;
  }

  // Users of this class must call this every second!
  tick() {
    this.seconds++;
  }
}
