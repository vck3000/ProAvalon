import { Server } from 'socket.io';
import * as redisIoAdapter from 'socket.io-redis';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { OnlineSocketsService } from '../auth/online-sockets/online-sockets.service';
import {
  SocketEvents,
  ChatResponseType,
  ChatResponse,
} from '../../proto/lobbyProto';

@WebSocketGateway()
class RedisAdapter {
  @WebSocketServer() server!: Server;

  constructor(private onlineSocketsService: OnlineSocketsService) {}

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

  // Returns true if successful, returns false if no socket was found.
  async emitToUsername(username: string, text: string, type: ChatResponseType) {
    const socketId = await this.onlineSocketsService.get(username);

    const res: ChatResponse = {
      text,
      username,
      timestamp: new Date(),
      type,
    };

    if (socketId) {
      this.server.to(socketId).emit(SocketEvents.ALL_CHAT_TO_CLIENT, res);
      return true;
    }
    return false;
  }

  clientRooms(id: string) {
    return new Promise<string[]>((resolve, reject) => {
      this.get().clientRooms(id, (err, rooms) => {
        if (err) {
          reject(err);
        }
        resolve(rooms);
      });
    });
  }

  // TODO: Remove if unused later
  remoteJoin(id: string, room: string) {
    return new Promise((resolve, reject) => {
      this.get().remoteJoin(id, room, (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
}

export default RedisAdapter;
