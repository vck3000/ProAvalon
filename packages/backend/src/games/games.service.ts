import { Injectable, Logger } from '@nestjs/common';
import Game from './game';
import { ChatResponse } from '../../proto/lobbyProto';
import RedisAdapter from '../redis-adapter/redis-adapter.service';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  private games: Map<number, Game> = new Map();

  private id = 0;

  constructor(private readonly redisAdapter: RedisAdapter) {}

  createGame(): number {
    this.id += 1;
    this.logger.log(`Creating Game ${this.id}.`);
    this.games.set(this.id, new Game(this.id));

    // Don't have more than 100 concurrent games
    // TODO: Remove this later
    if (this.games.size > 5) {
      const oldestGameId = this.games.keys().next().value;
      this.closeGame(oldestGameId);
      this.logger.log(
        `Deleted Game ${oldestGameId} due to too many open rooms.`,
      );
    }

    return this.id;
  }

  closeGame(id: number): boolean {
    this.redisAdapter.closeRoom(`game:${id}`);
    return this.games.delete(id);
  }

  hasGame(id: number): boolean {
    return this.games.has(id);
  }

  storeChat(id: number, chatResponse: ChatResponse) {
    const game = this.games.get(id);
    if (game) {
      this.logger.log(`Passing on chat to game ${id}.`);
      game.storeChat(chatResponse);
    }
  }
}
