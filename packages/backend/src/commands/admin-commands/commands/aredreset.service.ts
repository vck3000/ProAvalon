import { Injectable } from '@nestjs/common';
import { SocketUser } from '../../../users/users.socket';
import { emitCommandResponse } from '../../commandResponse';
import { Command } from '../../commands.types';
import RedisClientService from '../../../redis-client/redis-client.service';

@Injectable()
export class ARedisResetService implements Command {
  command = 'aredreset';

  help = '/aredreset: Reset the redis database';

  constructor(private readonly redisClient: RedisClientService) {}

  async run(socket: SocketUser) {
    this.redisClient.client.flushdb((err) => {
      if (err) {
        emitCommandResponse('Failed to flush redis.', socket);
        return;
      }
      emitCommandResponse('Successfully flushed redis.', socket);
    });
  }
}
