import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { transformAndValidate } from '@proavalon/proto';
import { ChatResponse, SocketEvents } from '@proavalon/proto/lobby';
import { CreateGameDto, LobbyGame } from '@proavalon/proto/game';
import RedisAdapterService from '../redis-adapter/redis-adapter.service';
import RedisClientService from '../redis-client/redis-client.service';
import Game from './game';
import { SocketUser } from '../users/users.socket';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    private readonly redisClientService: RedisClientService,
    private readonly redisAdapterService: RedisAdapterService,
  ) {}

  async createGame(socket: SocketUser, data: CreateGameDto): Promise<number> {
    // Create the game number and open in Redis
    let nextGameNum = -1;
    await this.redisClientService.lockDo(
      'games:open',
      async (client, multi) => {
        // Get the nextGameNum
        nextGameNum = Number(await client.get('games:nextNum'));

        // If nextGameNum hasn't been set yet, start from 1.
        if (nextGameNum === 0) {
          nextGameNum = 1;
          multi.incr('games:nextNum');
        }

        // Add data to Redis
        multi.rpush('games:open', Number(nextGameNum));
        multi.incr('games:nextNum');
      },
    );

    // Create the game state and save in Redis
    try {
      const newGameState = await Game.createNewGameState(
        socket,
        data,
        nextGameNum,
      );
      await this.redisClientService.client.set(
        `game:${nextGameNum}`,
        JSON.stringify(newGameState),
      );

      this.logger.log(`Done creating game ${nextGameNum}.`);

      this.updateLobbyGames();

      return nextGameNum;
    } catch (e) {
      this.logger.error(e);
      throw new WsException('Failed to create a game.');
    }
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

  async updateLobbyGames() {
    // Get games and send it out
    const gameIds = await this.redisClientService.client.lrange(
      'games:open',
      0,
      -1,
    );

    const gameStrings = await Promise.all(
      gameIds.map((gameId) =>
        this.redisClientService.client.get(`game:${gameId}`),
      ),
    );

    this.logger.log(gameStrings);

    const lobbyGames: LobbyGame[] = [];
    gameStrings.forEach((gameString) => {
      if (gameString) {
        lobbyGames.push(new Game(gameString).getLobbyData());
      }
    });

    const lobbyGamesValidated = await transformAndValidate(
      LobbyGame,
      lobbyGames,
    );

    this.redisAdapterService.server
      .to('lobby')
      .emit(SocketEvents.UPDATE_LOBBY_GAMES, lobbyGamesValidated);
  }
}
