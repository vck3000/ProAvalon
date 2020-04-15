import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatRequest, ChatResponse } from '../../proto/bundle';
import { getProtoTimestamp } from '../../proto/timestamp';
import SocketEvents from '../../proto/socketEvents';
import { SocketUser } from '../users/users.socket';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer() server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private chatService: ChatService) {}

  @SubscribeMessage(SocketEvents.ALL_CHAT_TO_SERVER)
  async handleMessage(socket: SocketUser, chatRequest: any) {
    const decoded = ChatRequest.decode(chatRequest);

    if (decoded.text) {
      this.logger.log(
        `All chat message: ${socket.user.username}: ${decoded.text} `,
      );

      const chatResponse = ChatResponse.create({
        text: decoded.text,
        username: socket.user.displayUsername,
        timestamp: getProtoTimestamp(),
        type: ChatResponse.ChatResponseType.CHAT,
      });

      this.chatService.storeMessage(chatResponse);
      this.server
        .to('lobby')
        .emit(
          SocketEvents.ALL_CHAT_TO_CLIENT,
          ChatResponse.encode(chatResponse).finish(),
        );
    }
  }
}
