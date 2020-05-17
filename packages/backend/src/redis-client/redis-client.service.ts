import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import * as Redis from 'ioredis';
import * as util from 'util';
import { REDIS_HOST, REDIS_PORT } from '../util/getEnvVars';

@Injectable()
export default class RedisClientService implements OnModuleDestroy {
  client: Redis.Redis;

  private readonly logger = new Logger(RedisClientService.name);

  constructor() {
    this.client = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  /**
   * Applies a lock onto the Redis database for a given key and runs a set of
   * operations described in the `func` argument.
   *
   * @param {string} key - The key to watch for changes.
   * @param {(client: Redis.Redis, multi: Redis.Pipeline => Promise<void>)} setMulti
   * - A function that applies operations on `multi`. `client` is given for immediate Redis queries.
   * @param {number} [retryLimit] - (Optional) Number of times to retry. Default 3.
   * @param {number} [retryNum] - (Optional) Specifies retry it is on. Default 0.
   */
  async lockDo(
    key: string,
    setMulti: (client: Redis.Redis, multi: Redis.Pipeline) => Promise<void>,
    retryLimit = 3, // Default starting values
    retryNum = 0,
  ): Promise<boolean> {
    // Create a new client so watch doesn't stop the main client.
    const client = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
    await client.watch(key);
    const multi = client.multi();

    // Set the operations from the given function.
    await setMulti(client, multi);

    // Run the queued up operations.
    const redisReturn = await multi.exec();

    // Disconnect the client.
    client.disconnect();

    // If the return is a single null, then it failed.
    if (redisReturn == null) {
      this.logger.log(`[lockDo] Trying again: ${key}`);
      // Call it asynchronously to retry
      if (retryNum < retryLimit) {
        return this.lockDo(key, setMulti, retryLimit, retryNum + 1);
      }
      throw new Error(
        `Redis lockDo on ${key} has failed after retrying too many times.`,
      );
    } else {
      this.logger.log(
        `[lockDo] Finishing ${key} successfully. Redis return was: ${util.inspect(
          redisReturn,
        )}`,
      );
      return false;
    }
  }
}
