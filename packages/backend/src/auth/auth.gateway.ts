import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  // SubscribeMessage,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { ChatService } from '../chat/chat.service';
import { SocketUser } from '../users/users.socket';

import { ChatResponse } from '../../proto/bundle';
import { getProtoTimestamp } from '../../proto/timestamp';
import SocketEvents from '../../proto/socketEvents';
import redisClient from '../util/redisClient';
import RedisAdapter from '../util/redisAdapter';

@WebSocketGateway()
export class AuthGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  redisAdapter!: RedisAdapter;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private chatService: ChatService,
  ) {}

  afterInit() {
    this.redisAdapter = new RedisAdapter(this.server);
  }

  private readonly logger = new Logger(AuthGateway.name);

  // Guard the handle connection, first point of contact.
  // If we need to only authenticate certain parts later,
  // we can do it when the client requests to move to a room.
  async handleConnection(socket: SocketUser) {
    this.logger.log('New socket connection, authenticating...');
    // Authenticating new connection:
    const { token } = socket.handshake.query;

    try {
      // Verify token
      const decoded = this.jwtService.verify(token);
      // See if user data in token exists
      if (decoded && decoded.username) {
        const user = await this.usersService.findByUsername(decoded.username);
        if (!user) {
          throw new Error('Unauthorized');
        }
        // eslint-disable-next-line no-param-reassign
        socket.user = user;

        // Check to see if they are already connected on redis
        const connectedSocketId = await redisClient.get(
          `users:${user.username}`,
        );

        // If they are already connected somewhere else, disconnect them.
        if (connectedSocketId) {
          this.logger.log(
            `${user.username} has an active socket. Killing previous...`,
          );
          this.server.to(connectedSocketId).emit('forceDisconnect');
          await this.redisAdapter.remoteDisconnect(connectedSocketId, true);
        }
      }
    } catch (e) {
      this.logger.log('New socket connection unauthorized...');
      socket.emit('unauthorized', 'Client socket is not authorized.');
      socket.disconnect();
      return;
    }

    this.logger.log('New socket connection authorized.');

    this.logger.log(`Recording ${socket.user.username}'s socket in redis.`);
    // Set a new record of their connection. 30s to expire as pings happen every 25s.
    await redisClient.set(
      `users:${socket.user.username}`,
      socket.id,
      'NX',
      'EX',
      30,
    );

    // Attach a listener to the packet for pings.
    socket.conn.on('packet', async (packet) => {
      if (packet.type === 'ping') {
        this.logger.log(
          `Updating ${socket.user.username}'s socket record in redis.`,
        );
        await redisClient.set(
          `users:${socket.user.username}`,
          socket.id,
          'XX',
          'EX',
          30,
        );
      }
    });

    // Successful authentication
    socket.join('lobby');

    //--------------------------------------------------------

    const chatResponse = ChatResponse.create({
      text: `${socket.user.username} has joined the lobby`,
      timestamp: getProtoTimestamp(),
      username: socket.user.username,
      type: ChatResponse.ChatResponseType.PLAYER_JOIN_LOBBY,
    });

    this.chatService.storeMessage(chatResponse);

    socket
      .to('lobby')
      .emit(
        SocketEvents.ALL_CHAT_TO_CLIENT,
        ChatResponse.encode(chatResponse).finish(),
      );

    // Online player count
    const count = await new Promise((resolve, reject) =>
      this.redisAdapter.get().clients(['lobby'], (err, clients) => {
        if (err) {
          reject(err);
        } else {
          resolve(clients.length);
        }
      }),
    );

    this.logger.log(`Online player count: ${count}.`);
    const onlinePlayerCountMsg = ChatResponse.create({
      text: `There are ${count} players connected!`,
      timestamp: getProtoTimestamp(),
      username: socket.user.username,
      type: ChatResponse.ChatResponseType.CREATE_ROOM,
    });

    this.chatService.storeMessage(onlinePlayerCountMsg);

    socket
      .to('lobby')
      .emit(
        SocketEvents.ALL_CHAT_TO_CLIENT,
        ChatResponse.encode(onlinePlayerCountMsg).finish(),
      );
  }

  async handleDisconnect(socket: SocketUser) {
    // This is the only route in danger of not having user defined.
    if (!socket.user) {
      this.logger.log('No socket.user, prematurely returning in disconnect');
      return;
    }

    // Remove their record on redis - no need to await
    this.logger.log(
      `Removing ${socket.user.username}'s socket record in redis.`,
    );
    redisClient.del(`users:${socket.user.username}`);

    this.logger.log(`Player left lobby: ${socket.id}.`);

    const chatResponse = ChatResponse.create({
      text: `${socket.user.username} has left the lobby`,
      timestamp: getProtoTimestamp(),
      username: socket.user.username,
      type: ChatResponse.ChatResponseType.PLAYER_LEAVE_LOBBY,
    });

    this.chatService.storeMessage(chatResponse);

    socket
      .to('lobby')
      .emit(
        SocketEvents.ALL_CHAT_TO_CLIENT,
        ChatResponse.encode(chatResponse).finish(),
      );

    // Online player count
    const count = await new Promise((resolve, reject) =>
      this.redisAdapter.get().clients(['lobby'], (err, clients) => {
        if (err) {
          reject(err);
        } else {
          resolve(clients.length);
        }
      }),
    );

    this.logger.log(`Online player count: ${count}.`);
    const onlinePlayerCountMsg = ChatResponse.create({
      text: `There are ${count} players connected!`,
      timestamp: getProtoTimestamp(),
      username: socket.user.username,
      type: ChatResponse.ChatResponseType.CREATE_ROOM,
    });

    this.chatService.storeMessage(onlinePlayerCountMsg);

    socket
      .to('lobby')
      .emit(
        SocketEvents.ALL_CHAT_TO_CLIENT,
        ChatResponse.encode(onlinePlayerCountMsg).finish(),
      );
  }
}
