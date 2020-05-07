import { Module } from '@nestjs/common';
import RedisAdapter from './redis-adapter.service';
import { OnlineSocketsModule } from '../auth/online-sockets/online-sockets.module';

@Module({
  imports: [OnlineSocketsModule],
  providers: [RedisAdapter],
  exports: [RedisAdapter],
})
export class RedisAdapterModule {}
