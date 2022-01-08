import Room from '../gameplay/room';

type Socket = {
  emit: (message: string, data: any) => boolean;
};

type GetSocketFunc = (username: string) => Socket;
type CreateRoomFunc = () => Room;

export class MatchmakingQueue {
  unrankedQueue: string[];
  rankedQueue: string[];

  getSocketFunc: GetSocketFunc;
  createRoomFunc: CreateRoomFunc;

  constructor(getSocketFunc: GetSocketFunc, createRoomFunc: CreateRoomFunc) {
    this.unrankedQueue = [];
    this.rankedQueue = [];

    this.getSocketFunc = getSocketFunc;
    this.createRoomFunc = createRoomFunc;
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
      const room = this.createRoomFunc();

      // Force sockets to join the room.
      for (const socket of sockets) {
        socket.emit('joinRoom', { roomId: room.roomId });
      }

      this.unrankedQueue = [];
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
