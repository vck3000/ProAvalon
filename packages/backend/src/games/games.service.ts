import { Injectable, Logger } from '@nestjs/common';
// import Game from './game';
import { ChatResponse } from '../../proto/lobbyProto';
import RedisAdapterService from '../redis-adapter/redis-adapter.service';
import RedisClientService from '../redis-client/redis-client.service';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    private readonly redisClientService: RedisClientService,
    private readonly redisAdapterService: RedisAdapterService,
  ) {}

  async createGame(): Promise<number> {
    let nextGameNum = -1;
    await this.redisClientService.lockDo(
      'games:open',
      async (client, multi) => {
        nextGameNum = Number(await client.get('games:nextNum'));

        // If nextGameNum hasn't been set yet, start from 1.
        if (nextGameNum === 0) {
          nextGameNum = 1;
          multi.incr('games:nextNum');
        }

        multi.rpush('games:open', Number(nextGameNum));
        multi.incr('games:nextNum');
      },
    );

    this.logger.log(`Done creating game ${nextGameNum}.`);

    return nextGameNum;
  }

  closeGame(id: number): boolean {
    this.redisAdapterService.closeRoom(`game:${id}`);
    this.redisClientService.client.lrem('games:open', 0, id.toString());
    return true;
  }

  async hasGame(id: number): Promise<boolean> {
    const ids = await this.redisClientService.client.lrange(
      'games:open',
      0,
      -1,
    );
    this.logger.log(`Has game ${id}: ${ids.includes(id.toString())}`);
    return ids.includes(id.toString());
  }

  storeChat(_id: number, _chatResponse: ChatResponse) {
    // const game = this.games.get(id);
    // if (game) {
    //   this.logger.log(`Passing on chat to game ${id}.`);
    //   game.storeChat(chatResponse);
    // }
  }
}
