import { Module } from '@nestjs/common';
import { CommandsService } from './commands.service';
import { RedisAdapterModule } from '../redis-adapter/redis-adapter.module';

@Module({
  imports: [RedisAdapterModule],
  providers: [CommandsService],
  exports: [CommandsService],
})
export class CommandsModule {}
