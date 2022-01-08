export class Queue {
  unrankedQueue: string[];
  rankedQueue: string[];

  constructor() {
    this.unrankedQueue = [];
    this.rankedQueue = [];
  }

  joinUnrankedQueue(username: string): void {
    this.unrankedQueue.push(username.toLowerCase());
  }
  joinRankedQueue(username: string): void {
    this.rankedQueue.push(username.toLowerCase());
  }

  leaveUnrankedQueue(username: string): void {
    var index =this.unrankedQueue.indexOf(username.toLowerCase());
    if(index!= -1){
      this.unrankedQueue.splice(index);
    }
  }
  leaveRankedQueue(username: string): void {
    var index =this.rankedQueue.indexOf(username.toLowerCase());
    if(index!= -1){
      this.rankedQueue.splice(index);
    }
  }

  getQueueSizeUnranked(): number {
    return this.unrankedQueue.length;
  }
  getQueueSizeRanked(): number {
    return this.rankedQueue.length;
  }
}
