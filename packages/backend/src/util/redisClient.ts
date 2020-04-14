import * as Redis from 'ioredis';
import { REDIS_HOST, REDIS_PORT } from './getEnvVars';

const redisClient = new Redis({ host: REDIS_HOST, port: REDIS_PORT });

export default redisClient;
