import { Server } from 'socket.io';
import * as redisIoAdapter from 'socket.io-redis';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

// This class is to wrap methods in promises.
@WebSocketGateway()
class RedisAdapter {
  @WebSocketServer() server!: Server;

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
