import { Server } from 'socket.io';
import * as redisIoAdapter from 'socket.io-redis';

// This class is to wrap methods in promises.
class RedisAdapter {
  server: Server;

  constructor(server: Server) {
    this.server = server;
  }

  get() {
    return this.server.sockets.adapter as redisIoAdapter.RedisAdapter;
  }

  remoteDisconnect(id: string, close: boolean) {
    return new Promise((resolve, reject) => {
      this.get().remoteDisconnect(id, close, (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
}

export default RedisAdapter;
