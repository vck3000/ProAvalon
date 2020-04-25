import { Module } from '@nestjs/common';
import { OnlinePlayersService } from './online-players.service';
import RedisClientModule from '../../redis-client/redis-client.module';

@Module({
  imports: [RedisClientModule],
  providers: [OnlinePlayersService],
  exports: [OnlinePlayersService],
})
export class OnlinePlayersModule {}
