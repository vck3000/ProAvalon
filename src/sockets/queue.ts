export class Queue {
  unrankedQueue: string[];

  constructor() {
    this.unrankedQueue = [];
  }

  joinQueue(username: string): void {
    this.unrankedQueue.push(username);
  }

  getQueueSizeUnranked(): number {
    return this.unrankedQueue.length;
  }
}
