import { Module } from '@nestjs/common';
import { OnlineSocketsService } from './online-sockets.service';
import { RedisClientModule } from '../../redis-client/redis-client.module';

@Module({
  imports: [RedisClientModule],
  providers: [OnlineSocketsService],
  exports: [OnlineSocketsService],
})
export class OnlineSocketsModule {}
