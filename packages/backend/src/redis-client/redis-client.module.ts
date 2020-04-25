import { Module } from '@nestjs/common';
import RedisClient from './redis-client.service';

@Module({
  providers: [RedisClient],
  exports: [RedisClient],
})
export default class RedisClientModule {}
