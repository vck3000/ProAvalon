const NUM_REJECTS_PER_WINDOW = 2;
const WINDOW_TIME_MILLIS = 60 * 1000;

export class JoinQueueFilter {
  private userRejectHistoryData: Map<string, Date[]> = new Map();
  private getTimeFunc: () => Date;

  constructor(getTimeFunc: () => Date) {
    this.getTimeFunc = getTimeFunc;
  }

  // Returns true if user can join queue. Else false.
  joinQueueRequest(username: string): boolean {
    username = username.toLowerCase();

    // No history of any rejects. Can join queue.
    if (!this.userRejectHistoryData.has(username)) {
      return true;
    }

    const userRejectHistory = this.userRejectHistoryData.get(username);

    // If any time is outside time window, user can join.
    const currentTime = this.getTimeFunc();

    if (userRejectHistory.length < NUM_REJECTS_PER_WINDOW) {
      return true;
    }

    for (const date of userRejectHistory) {
      if (currentTime.getTime() - date.getTime() > WINDOW_TIME_MILLIS) {
        return true;
      }
    }

    return false;
  }

  registerReject(username: string): void {
    username = username.toLowerCase();

    if (!this.userRejectHistoryData.has(username)) {
      this.userRejectHistoryData.set(username, []);
    }

    const userRejectHistory = this.userRejectHistoryData.get(username);

    userRejectHistory.push(this.getTimeFunc());
    if (userRejectHistory.length > NUM_REJECTS_PER_WINDOW) {
      // Take one off from the front.
      userRejectHistory.shift();
    }
  }
}
