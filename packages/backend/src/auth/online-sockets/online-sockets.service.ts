import { Injectable, Logger } from '@nestjs/common';

import RedisClientService from '../../redis-client/redis-client.service';

@Injectable()
export class OnlineSocketsService {
  private readonly logger = new Logger(OnlineSocketsService.name);

  constructor(private readonly redisClientService: RedisClientService) {}

  async get(username: string) {
    this.logger.log(`Checking ${username} socket connected...`);
    return this.redisClientService.redisClient.get(`user:${username}`);
  }

  async register(username: string, socketId: string) {
    this.logger.log(`Registering ${username}.`);
    return this.redisClientService.redisClient.set(
      `user:${username}`,
      socketId,
      'NX',
      'EX',
      30,
    );
  }

  async update(username: string, socketId: string) {
    this.logger.log(`Updating ${username}.`);
    return this.redisClientService.redisClient.set(
      `user:${username}`,
      socketId,
      'XX',
      'EX',
      30,
    );
  }

  async deregister(username: string) {
    this.logger.log(`Deregistering ${username}.`);
    return this.redisClientService.redisClient.del(`user:${username}`);
  }
}
