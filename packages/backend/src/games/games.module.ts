import { Module, forwardRef } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesGateway } from './games.gateway';
import { RedisAdapterModule } from '../redis-adapter/redis-adapter.module';
import { RedisClientModule } from '../redis-client/redis-client.module';
import { CommandsModule } from '../commands/commands.module';

@Module({
  imports: [
    RedisAdapterModule,
    RedisClientModule,
    forwardRef(() => CommandsModule),
  ],
  controllers: [],
  providers: [GamesService, GamesGateway],
  exports: [GamesService],
})
export class GamesModule {}
