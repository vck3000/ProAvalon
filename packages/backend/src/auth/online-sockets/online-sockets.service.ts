import { Injectable, Logger } from '@nestjs/common';

import redisClient from '../../util/redisClient';

@Injectable()
export class OnlineSocketsService {
  private readonly logger = new Logger(OnlineSocketsService.name);

  async connected(username: string) {
    this.logger.log(`Checking ${username} socket connected...`);
    return redisClient.get(`user:${username}`);
  }

  async register(username: string, socketId: string) {
    this.logger.log(`Registering ${username}.`);
    return redisClient.set(`user:${username}`, socketId, 'NX', 'EX', 30);
  }

  async update(username: string, socketId: string) {
    this.logger.log(`Updating ${username}.`);
    return redisClient.set(`user:${username}`, socketId, 'XX', 'EX', 30);
  }

  async deregister(username: string) {
    this.logger.log(`Deregistering ${username}.`);
    return redisClient.del(`user:${username}`);
  }
}
