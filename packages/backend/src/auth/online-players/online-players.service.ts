import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Server } from 'socket.io';
import { transformAndValidate } from '@proavalon/proto';
import { SocketEvents, OnlinePlayer } from '@proavalon/proto/lobby';

import RedisClientService from '../../redis-client/redis-client.service';

@Injectable()
export class OnlinePlayersService implements OnModuleDestroy {
  private readonly logger = new Logger(OnlinePlayersService.name);

  interval: NodeJS.Timeout;

  constructor(private readonly redisClientService: RedisClientService) {
    // Start the interval ONLY ONCE to remove players that should be disconnected.
    this.logger.log(
      'Starting periodic "remove expired online players" requests..',
    );
    this.interval = setInterval(async () => {
      this.logger.log('Removing expired online players in redis.');
      await this.redisClientService.client.zremrangebyscore(
        'onlineplayers',
        '-inf',
        new Date().getTime().toString(),
      );
    }, 30 * 1000); // 30 seconds
  }

  onModuleDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  async register(username: string, server: Server) {
    this.logger.log(`Registering ${username}.`);
    // Set a new record of their connection in a set every 25s.
    await this.redisClientService.client.zadd(
      'onlineplayers',
      'NX',
      (new Date().getTime() + 25 * 1000).toString(),
      username,
    );

    this.sendOnlinePlayers(server);
  }

  async update(username: string) {
    this.logger.log(`Updating ${username}.`);
    return this.redisClientService.client.zadd(
      'onlineplayers',
      'XX',
      (new Date().getTime() + 25 * 1000).toString(),
      username,
    );
  }

  async deregister(username: string, server: Server) {
    this.logger.log(`Deregistering ${username}.`);
    await this.redisClientService.client.zrem('onlineplayers', username);

    this.sendOnlinePlayers(server);
  }

  // Run privately from register or deregister.
  private async sendOnlinePlayers(server: Server) {
    this.logger.log('Sending all online players');
    const onlinePlayers = await this.redisClientService.client.zrange(
      'onlineplayers',
      0,
      -1,
    );
    this.logger.log(
      `${onlinePlayers.length} online players: ${onlinePlayers.join(', ')}.`,
    );

    try {
      const players = await transformAndValidate(
        OnlinePlayer,
        onlinePlayers.map((username: string) => ({
          username,
          rewards: [],
        })),
      );
      server.to('lobby').emit(SocketEvents.ONLINE_PLAYERS, players);
    } catch (err) {
      this.logger.error('Validation failed. Error: ', err);
    }
  }
}
