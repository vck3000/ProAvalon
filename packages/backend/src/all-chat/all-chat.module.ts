import { Module } from '@nestjs/common';
import { AllChatController } from './all-chat.controller';
import { AllChatGateway } from './all-chat.gateway';
import { AllChatService } from './all-chat.service';
import { CommandsModule } from '../commands/commands.module';
import { RedisAdapterModule } from '../redis-adapter/redis-adapter.module';

@Module({
  imports: [CommandsModule, RedisAdapterModule],
  controllers: [AllChatController],
  providers: [AllChatService, AllChatGateway],
  exports: [AllChatService],
})
export class AllChatModule {}
