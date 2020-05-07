import { SocketUser } from '../users/users.socket';
import RedisAdapter from '../redis-adapter/redis-adapter.service';

export interface Command {
  command: string;
  help: string;
  run: (
    data: string[],
    senderSocket: SocketUser,
    redisAdapter: RedisAdapter,
  ) => void;
}
