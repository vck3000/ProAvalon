import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { UserCommandsService } from './user-commands/user-commands.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, UserCommandsService],
  exports: [ChatService],
})
export class ChatModule {}
