import { Logger } from '@nestjs/common';
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

  private readonly logger = new Logger(RedisAdapter.name);

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

  async closeRoom(room: string) {
    // Get all the client ids connected to the room
    const clients: string[] = await new Promise((resolve, reject) => {
      this.get().clients([room], (err, connectedSocketIds) => {
        if (err) {
          reject(err);
        }
        resolve(connectedSocketIds);
      });
    });

    // Collect them all into remoteLeave promises
    const promises = clients.map(
      (client) =>
        new Promise((resolve, _reject) => {
          this.get().remoteLeave(client, room, (err) => {
            if (err) {
              // Resolve here so that promise.all doesn't stop on a single reject.
              this.logger.log(`Could not remoteLeave client: ${err}`);
              resolve(err);
            }
            resolve();
          });
        }),
    );

    return Promise.all(promises);
  }
}

export default RedisAdapter;
