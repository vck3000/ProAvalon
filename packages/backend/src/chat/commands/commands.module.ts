import { Module } from '@nestjs/common';
import { CommandsService } from './commands.service';
import RedisModule from '../../redis-adapter/redis-adapter.module';

@Module({
  imports: [RedisModule],
  providers: [CommandsService],
  exports: [CommandsService],
})
export class CommandsModule {}
