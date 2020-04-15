import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

import redisClient from '../../util/redisClient';
import { SocketEvents } from '../../../proto/lobbyProto';

@Injectable()
export class OnlinePlayersService {
  private readonly logger = new Logger(OnlinePlayersService.name);

  constructor() {
    // Start the interval ONLY ONCE to remove players that should be disconnected.
    this.logger.log(
      'Starting periodic "remove expired online players" requests..',
    );
    setInterval(async () => {
      this.logger.log('Removing expired online players in redis.');
      await redisClient.zremrangebyscore(
        'onlineplayers',
        '-inf',
        new Date().getTime().toString(),
      );
    }, 30 * 1000); // 30 seconds
  }

  async register(username: string, server: Server) {
    this.logger.log(`Registering ${username}.`);
    // Set a new record of their connection in a set every 25s.
    await redisClient.zadd(
      'onlineplayers',
      'NX',
      (new Date().getTime() + 25 * 1000).toString(),
      username,
    );

    this.sendOnlinePlayers(server);
  }

  async update(username: string) {
    this.logger.log(`Updating ${username}.`);
    return redisClient.zadd(
      'onlineplayers',
      'XX',
      (new Date().getTime() + 25 * 1000).toString(),
      username,
    );
  }

  async deregister(username: string, server: Server) {
    this.logger.log(`Deregistering ${username}.`);
    await redisClient.zrem('onlineplayers', username);

    this.sendOnlinePlayers(server);
  }

  // Run privately from register or deregister.
  private async sendOnlinePlayers(server: Server) {
    this.logger.log('Sending all online players');
    const onlinePlayers = await redisClient.zrange('onlineplayers', 0, -1);
    this.logger.log(
      `${onlinePlayers.length} online players: ${onlinePlayers.join(', ')}.`,
    );

    server.to('lobby').emit(SocketEvents.ONLINE_PLAYERS, onlinePlayers);
  }
}
