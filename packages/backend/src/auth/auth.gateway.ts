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

@WebSocketGateway()
export class AuthGateway implements OnGatewayConnection {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private chatService: ChatService,
  ) {}

  @WebSocketServer() server!: Server;

  private readonly logger = new Logger(AuthGateway.name);

  // Guard the handle connection, first point of contact.
  // If we need to only authenticate certain parts later,
  // we can do it when the client requests to move to a room.
  async handleConnection(socket: SocketUser) {
    this.logger.log('New socket connection, authenticating...');
    // Authenticating new connection:
    const { token } = socket.handshake.query;

    try {
      const decoded = this.jwtService.verify(token);
      if (decoded && decoded.username) {
        const user = await this.usersService.findByUsername(decoded.username);
        if (!user) {
          throw new Error('Unauthorized');
        }
        // eslint-disable-next-line no-param-reassign
        socket.user = user;
      }
    } catch (e) {
      this.logger.log('New socket connection unauthorized...');
      socket.emit('unauthorized', 'Client socket is not authenticated.');
      socket.disconnect();
      return;
    }

    this.logger.log('New socket connection authenticated.');

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
    if (this.server.sockets.adapter.rooms.lobby) {
      const count = this.server.sockets.adapter.rooms.lobby.length;
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

  async handleDisconnect(socket: SocketUser) {
    // This is the only route in danger of not having user defined.
    if (!socket.user) {
      this.logger.log('No socket.user, prematurely returning in disconnect');
      return;
    }

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
    if (this.server.sockets.adapter.rooms.lobby) {
      const count = this.server.sockets.adapter.rooms.lobby.length;
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
}
