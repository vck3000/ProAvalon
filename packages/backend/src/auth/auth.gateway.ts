import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import {
  transformAndValidate,
  SocketEvents,
  ChatResponse,
  ChatResponseType,
} from '@proavalon/proto';

import { UsersService } from '../users/users.service';
import { AllChatService } from '../all-chat/all-chat.service';
import { SocketUser } from '../users/users.socket';

import RedisAdapterService from '../redis-adapter/redis-adapter.service';
import { OnlinePlayersService } from './online-players/online-players.service';
import { OnlineSocketsService } from './online-sockets/online-sockets.service';

@WebSocketGateway()
export class AuthGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private allChatService: AllChatService,
    private onlinePlayersService: OnlinePlayersService,
    private onlineSocketsService: OnlineSocketsService,
    private redisAdapter: RedisAdapterService,
  ) {}

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
        const connectedSocketId = await this.onlineSocketsService.get(
          socket.user.username,
        );

        // If they are already connected somewhere else, disconnect them.
        if (connectedSocketId) {
          this.logger.log(
            `${user.username} has an active socket. Killing previous...`,
          );
          this.server.to(connectedSocketId).emit('forceDisconnect');
          try {
            await this.redisAdapter.remoteDisconnect(connectedSocketId, true);
          } catch (e) {
            this.logger.warn(
              `Failed to remote disconnect ${user.username}'s previous active socket.`,
            );
          }
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
    // Set a new record of their connection.
    this.onlineSocketsService.register(socket.user.username, socket.id);
    this.onlinePlayersService.register(
      socket.user.displayUsername,
      this.server,
    );

    // Attach a listener to the packet for pings.
    socket.conn.on('packet', async (packet) => {
      if (packet.type === 'ping') {
        this.logger.log(
          `Updating ${socket.user.username}'s socket record in redis.`,
        );
        this.onlineSocketsService.update(socket.user.username, socket.id);
        this.onlinePlayersService.update(socket.user.displayUsername);
      }
    });

    // Successful authentication
    socket.join('lobby');

    // Let client know that we have finished our checks and that
    // they can now request data if they need.
    socket.emit(SocketEvents.AUTHORIZED, null);

    // ----------------------------------------------------------

    try {
      const chatResponse = await transformAndValidate(ChatResponse, {
        text: `${socket.user.displayUsername} has joined the lobby`,
        timestamp: new Date(),
        username: socket.user.displayUsername,
        type: ChatResponseType.PLAYER_JOIN_LOBBY,
      });

      this.allChatService.storeMessage(chatResponse);
      socket.to('lobby').emit(SocketEvents.ALL_CHAT_TO_CLIENT, chatResponse);
    } catch (err) {
      this.logger.error('Validation failed. Error: ', err);
    }
  }

  async handleDisconnect(socket: SocketUser) {
    // This is the only route in danger of not having user defined.
    if (!socket.user) {
      this.logger.log('No socket.user, prematurely returning in disconnect');
      return;
    }

    // Remove their record on redis - no need to await
    this.onlineSocketsService.deregister(socket.user.username);
    this.onlinePlayersService.deregister(
      socket.user.displayUsername,
      this.server,
    );

    // ----------------------------------------------------------

    this.logger.log(`Player left lobby: ${socket.id}.`);

    try {
      const chatResponse = await transformAndValidate(ChatResponse, {
        text: `${socket.user.displayUsername} has left the lobby`,
        timestamp: new Date(),
        username: socket.user.displayUsername,
        type: ChatResponseType.PLAYER_JOIN_LOBBY,
      });

      this.allChatService.storeMessage(chatResponse);

      socket.to('lobby').emit(SocketEvents.ALL_CHAT_TO_CLIENT, chatResponse);
    } catch (err) {
      this.logger.error('Validation failed. Error: ', err);
    }
  }

  @SubscribeMessage(SocketEvents.USER_RECONNECT)
  async userReconnect(socket: SocketUser) {
    this.logger.log(`${socket.user.username} has reconnected`);
    // Set a new record of their connection.
    this.onlineSocketsService.register(socket.user.username, socket.id);
    this.onlinePlayersService.register(
      socket.user.displayUsername,
      this.server,
    );
    // Send them all chat or any further data they may require.
  }
}
