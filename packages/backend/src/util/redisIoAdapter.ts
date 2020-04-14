import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';
import * as redisIoAdapter from 'socket.io-redis';
import { REDIS_HOST, REDIS_PORT } from './getEnvVars';

const redisAdapter = redisIoAdapter({ host: REDIS_HOST, port: REDIS_PORT });

export class RedisIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    server.adapter(redisAdapter);
    return server;
  }
}

export const getRedisAdapter = (server: Server) =>
  server.sockets.adapter as redisIoAdapter.RedisAdapter;
