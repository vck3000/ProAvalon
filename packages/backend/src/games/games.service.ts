import { Injectable, Logger } from '@nestjs/common';
import Game from './game';
import { ChatResponse } from '../../proto/lobbyProto';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  private games: Map<number, Game> = new Map();

  private id = 0;

  createGame(): number {
    this.id += 1;
    this.logger.log(`Creating room ${this.id}.`);
    this.games.set(this.id, new Game(this.id));
    return this.id;
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
