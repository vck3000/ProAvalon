type MatchMakingQueueItem = {
  id: string;
  joinAt: number;
};

type SubscriberType = {
  subscriberId: string;
  onJoin: (playerId: string) => void;
  onLeave: (playerId: string) => void;
};

export class MatchMakingQueue {
  queue: MatchMakingQueueItem[] = [];
  subscribers: SubscriberType[] = [];
  subscribe({
    onJoin,
    onLeave,
    subscriberId,
  }: {
    onJoin: (playerId: string) => void; // call back function when player join the queue - eg: when a user join a queue, use onJoin to call join lobby api
    onLeave: (playerId: string) => void; // call back function when player leave the queue - eg: when a user leave a queue, we might call the function to re-calculate Elo score range
    subscriberId: string;
  }) {
    if (this.subscribers.find((item) => item.subscriberId === subscriberId)) {
      return { isSubscribed: false };
    }
    this.subscribers.push({ subscriberId, onJoin, onLeave });
    return { isSubscribed: true };
  }
  join(playerId: string) {
    this.queue.push({
      id: playerId,
      joinAt: Date.now(),
    });
    this.subscribers.forEach((subscriber) => subscriber.onJoin(playerId));
    return this.queue;
  }
  leave(playerId: string) {
    this.queue = this.queue.filter(({ id }) => {
      return id !== playerId;
    });
    this.subscribers.forEach((subscriber) => subscriber.onLeave(playerId));
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
  getLength() {
    return this.queue.length;
  }
  deleteFirstNPlayers(n: number) {
    if (n > this.queue.length) {
      return;
    }
    const removedPlayers = this.queue.slice(0, n);
    this.queue = this.queue.splice(0, n);
    return removedPlayers;
  }
  deleteMatchedPlayers(playerIDs: string[]) {
    this.queue = this.queue.filter(({ id }) => !playerIDs.includes(id));
  }
}
