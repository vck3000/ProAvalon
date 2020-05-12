import { SocketUser } from '../users/users.socket';
import RedisAdapterService from '../redis-adapter/redis-adapter.service';

export interface Command {
  command: string;
  help: string;
  run: (
    data: string[],
    senderSocket: SocketUser,
    redisAdapter: RedisAdapterService,
  ) => void;
}
