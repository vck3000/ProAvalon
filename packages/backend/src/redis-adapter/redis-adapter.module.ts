import { Module } from '@nestjs/common';
import RedisAdapterService from './redis-adapter.service';
import { OnlineSocketsModule } from '../auth/online-sockets/online-sockets.module';

@Module({
  imports: [OnlineSocketsModule],
  providers: [RedisAdapterService],
  exports: [RedisAdapterService],
})
export class RedisAdapterModule {}
