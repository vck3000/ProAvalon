import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { transformAndValidate } from 'class-transformer-validator';

import { ChatService } from './chat.service';
import {
  SocketEvents,
  ChatRequest,
  ChatResponse,
  ChatResponseType,
} from '../../proto/lobbyProto';
import { SocketUser } from '../users/users.socket';
import { UserCommandsService } from '../chat-commands/user-commands/user-commands.service';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer() server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private chatService: ChatService,
    private userCommandsService: UserCommandsService,
  ) {}

  @SubscribeMessage(SocketEvents.ALL_CHAT_TO_SERVER)
  async handleMessage(socket: SocketUser, chatRequest: ChatRequest) {
    if (chatRequest.text && chatRequest.text[0] !== '/') {
      this.logger.log(
        `All chat message: ${socket.user.username}: ${chatRequest.text} `,
      );

      try {
        const chatResponse = await transformAndValidate(ChatResponse, {
          text: chatRequest.text,
          username: socket.user.displayUsername,
          timestamp: new Date(),
          type: ChatResponseType.CHAT,
        });

        this.chatService.storeMessage(chatResponse);

        this.server
          .to('lobby')
          .emit(SocketEvents.ALL_CHAT_TO_CLIENT, chatResponse);
      } catch (err) {
        this.logger.error('Validation failed. Error: ', err);
      }
    }
  }

  @SubscribeMessage(SocketEvents.ALL_CHAT_TO_SERVER)
  async handleCommand(socket: SocketUser, chatRequest: ChatRequest) {
    if (chatRequest && chatRequest.text[0] === '/') {
      const [command, ...data] = chatRequest.text.slice(1).split(' ');
      this.userCommandsService.sendCommand(command, data, socket);
    }
  }
}
