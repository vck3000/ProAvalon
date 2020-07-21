/* asdf eslint-disable */
import { Injectable } from '@nestjs/common';
import { SocketUser } from '../../../users/users.socket';
import { emitCommandResponse } from '../../commandResponse';
import { Command } from '../../commands.types';
import RedisClientService from '../../../redis-client/redis-client.service';

@Injectable()
export class ARedisGamesService implements Command {
  command = 'aredgames';

  help =
    '/aredgames [gameId]: Returns gameIds of open rooms if no gameId is given. Returns game string of gameId if given.';

  constructor(private readonly redisClient: RedisClientService) {}

  async run(socket: SocketUser, data: string[]) {
    try {
      if (data.length === 0) {
        const openGames = await this.redisClient.client.lrange(
          'games:open',
          0,
          -1,
        );
        const nextGameId = await this.redisClient.client.get('games:nextNum');

        emitCommandResponse(
          `Open games: ${openGames}, nextGameId: ${nextGameId}`,
          socket,
        );
      } else {
        const gameId = data[0];
        const gameString = await this.redisClient.client.get(`game:${gameId}`);
        emitCommandResponse(`Game ${gameId}: ${gameString}`, socket);
      }
    } catch (e) {
      emitCommandResponse(`Error happened... ${e}`, socket);
    }
  }
}
