import Game from '../gameplay/game';

type Socket = {
  emit: (message: string) => boolean;
};

type GetSocketFunc = (username: string) => Socket;
type CreateGameFunc = () => Game;

export class MatchmakingQueue {
  unrankedQueue: string[];
  rankedQueue: string[];

  getSocketFunc: GetSocketFunc;
  createGameFunc: CreateGameFunc;

  constructor(getSocketFunc: GetSocketFunc, createGameFunc: CreateGameFunc) {
    this.unrankedQueue = [];
    this.rankedQueue = [];

    this.getSocketFunc = getSocketFunc;
    this.createGameFunc = createGameFunc;
  }

  joinUnrankedQueue(username: string): void {
    this.unrankedQueue.push(username.toLowerCase());

    if (this.unrankedQueue.length >= 6) {
      const usersMatched = this.unrankedQueue.slice();
      // Get all the sockets
      const sockets = [];
      for (const username of usersMatched) {
        sockets.push(this.getSocketFunc(username));
      }

      // Create the room
      const game = this.createGameFunc();
      game.this.unrankedQueue = [];
    }
  }

  joinRankedQueue(username: string): void {
    this.rankedQueue.push(username.toLowerCase());
  }

  leaveUnrankedQueue(username: string): void {
    var index = this.unrankedQueue.indexOf(username.toLowerCase());
    if (index != -1) {
      this.unrankedQueue.splice(index);
    }
  }

  leaveRankedQueue(username: string): void {
    var index = this.rankedQueue.indexOf(username.toLowerCase());
    if (index != -1) {
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

