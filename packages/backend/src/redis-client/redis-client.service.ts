import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as Redis from 'ioredis';
import { REDIS_HOST, REDIS_PORT } from '../util/getEnvVars';

@Injectable()
export default class RedisClientService implements OnModuleDestroy {
  redisClient: Redis.Redis;

  constructor() {
    this.redisClient = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
    // console.log('created');
  }

  onModuleDestroy() {
    // console.log('Destroying');
    if (this.redisClient) {
      // console.log('Destroyed');
      this.redisClient.disconnect();
    }
  }
}
