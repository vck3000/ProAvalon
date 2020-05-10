import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import * as Redis from 'ioredis';
import { REDIS_HOST, REDIS_PORT } from '../util/getEnvVars';

@Injectable()
export default class RedisClientService implements OnModuleDestroy {
  redisClient: Redis.Redis;

  private readonly logger = new Logger(RedisClientService.name);

  constructor() {
    this.redisClient = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
    // console.log('created');
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      this.logger.log('destroying');
      this.logger.log(this.redisClient.status);

      this.redisClient.disconnect();
      await this.redisClient.quit();

      await new Promise((resolve) => {
        this.redisClient.on('end', resolve);
      });

      this.logger.log(this.redisClient.status);
    }
  }
}
