import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { transformAndValidate } from '@proavalon/proto';
import {
  SocketEvents,
  ChatRequest,
  ChatResponse,
  ChatResponseType,
} from '@proavalon/proto/lobby';

import { AllChatService } from './all-chat.service';
import { SocketUser } from '../users/users.socket';
import { CommandsService } from '../commands/commands.service';

@WebSocketGateway()
export class AllChatGateway {
  @WebSocketServer() server!: Server;

  private readonly logger = new Logger(AllChatGateway.name);

  constructor(
    private allChatService: AllChatService,
    private commandsService: CommandsService,
  ) {}

  @SubscribeMessage(SocketEvents.ALL_CHAT_TO_SERVER)
  async handleAllChat(socket: SocketUser, chatRequest: ChatRequest) {
    if (chatRequest.text) {
      // Commands
      if (chatRequest.text[0] === '/') {
        this.commandsService.runCommand(chatRequest.text, socket);
        return;
      }

      // Chat message
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

        this.allChatService.storeMessage(chatResponse);

        this.server
          .to('lobby')
          .emit(SocketEvents.ALL_CHAT_TO_CLIENT, chatResponse);
      } catch (err) {
        this.logger.error('Validation failed. Error: ', err);
      }
    }
  }
}
