import { Injectable, Logger } from '@nestjs/common';
// import Game from './game';
import { ChatResponse } from '../../proto/lobbyProto';
// import RedisAdapterService from '../redis-adapter/redis-adapter.service';
import RedisClientService from '../redis-client/redis-client.service';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  // private games: Map<number, Game> = new Map();

  constructor(
    // private readonly redisAdapter: RedisAdapterService,
    private readonly redisClient: RedisClientService,
  ) {}

  async createGame(): Promise<number> {
    // Get the redis' last game id.
    const id = await this.redisClient.redisClient.incr('gameid');

    // this.id += 1;
    this.logger.log(`Creating Game ${id}.`);
    // this.games.set(id, new Game(id));

    // Don't have more than 100 concurrent games
    // TODO: Remove this later
    // if (this.games.size > 5) {
    //   const oldestGameId = this.games.keys().next().value;
    //   this.closeGame(oldestGameId);
    //   this.logger.log(
    //     `Deleted Game ${oldestGameId} due to too many open rooms.`,
    //   );
    // }

    return id;
  }

  closeGame(_id: number): boolean {
    // this.redisAdapter.closeRoom(`game:${id}`);
    // return this.games.delete(id);
    return true;
  }

  hasGame(_id: number): boolean {
    return true;
  }

  storeChat(_id: number, _chatResponse: ChatResponse) {
    // const game = this.games.get(id);
    // if (game) {
    //   this.logger.log(`Passing on chat to game ${id}.`);
    //   game.storeChat(chatResponse);
    // }
  }
}
