import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesGateway } from './games.gateway';
import { RedisAdapterModule } from '../redis-adapter/redis-adapter.module';
import { CommandsModule } from '../commands/commands.module';

@Module({
  imports: [RedisAdapterModule, CommandsModule],
  controllers: [],
  providers: [GamesService, GamesGateway],
  exports: [GamesService],
})
export class GamesModule {}
