import { randomUUID } from 'crypto';

export const subscribe = () => {};
type Item = {
  id: string;
  joinAt: number;
};

export class Queue {
  queue: Item[] = [];
  subscribers: any[] = [];
  subscribe({
    onJoin,
    onLeave,
  }: {
    onJoin: (playerID: string) => void;
    onLeave: (playerID: string) => void;
  }) {
    const id = randomUUID();
    this.subscribers.push({ id, onJoin, onLeave });
  }
  join(playerID: string) {
    // TODO - check if playerID is already exist
    this.queue.push({
      id: playerID,
      joinAt: Date.now(),
    });
    this.subscribers.forEach((subscriber) => subscriber.onJoin(playerID));
  }
  leave(playerID: string) {
    this.queue = this.queue.filter(({ id }) => {
      return id !== playerID;
    });
    this.subscribers.forEach((subscriber) => subscriber.onLeave(playerID));
  }
  get() {
    return this.queue;
  }
  getFirstNItems(n: number) {
    if (n > this.queue.length) {
      return;
    }
    return this.queue.slice(0, n);
  }
  deleteMatchedPlayers(playerIDs: string[]) {
    this.queue = this.queue.filter(({ id }) => !playerIDs.includes(id));
  }
}
