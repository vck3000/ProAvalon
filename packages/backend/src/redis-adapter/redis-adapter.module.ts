import { Module } from '@nestjs/common';
import RedisAdapter from './redis-adapter.service';
import { OnlineSocketsService } from '../auth/online-sockets/online-sockets.service';

@Module({
  providers: [RedisAdapter, OnlineSocketsService],
  exports: [RedisAdapter],
})
export default class RedisAdapterModule {}
