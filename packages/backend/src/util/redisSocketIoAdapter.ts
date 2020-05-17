import { IoAdapter } from '@nestjs/platform-socket.io';
import * as redisIoAdapter from 'socket.io-redis';
import { REDIS_HOST, REDIS_PORT } from './getEnvVars';

export class RedisSocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    const redisAdapter = redisIoAdapter({ host: REDIS_HOST, port: REDIS_PORT });
    server.adapter(redisAdapter);
    return server;
  }
}
