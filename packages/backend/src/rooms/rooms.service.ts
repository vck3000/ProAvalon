import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import {
  ChatResponse,
  LobbyRoomData,
  LobbySocketEvents,
} from '@proavalon/proto/lobby';
import { CreateRoomDto, RoomSocketEvents } from '@proavalon/proto/room';
import RedisAdapterService from '../redis-adapter/redis-adapter.service';
import RedisClientService from '../redis-client/redis-client.service';
import Room from './room';
import { SocketUser } from '../users/users.socket';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  constructor(
    private readonly redisClientService: RedisClientService,
    private readonly redisAdapterService: RedisAdapterService,
  ) {}

  async createGame(socket: SocketUser, data: CreateRoomDto): Promise<number> {
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
      const newGameState = await Room.createNewGameState(
        socket,
        data,
        nextGameNum,
      );
      await this.redisClientService.client.set(
        `game:${nextGameNum}`,
        JSON.stringify(newGameState),
      );

      this.logger.log(`Done creating game ${nextGameNum}.`);

      // Cap to 5 games for now
      const gameIds = await this.redisClientService.client.lrange(
        'games:open',
        0,
        -1,
      );

      while (gameIds.length > 5) {
        this.closeGame(parseInt(gameIds.shift() as string, 10));
      }

      this.updateLobbyGames();
      return nextGameNum;
    } catch (e) {
      this.logger.error(e);
      throw new WsException('Failed to create a game.');
    }
  }

  async closeGame(id: number): Promise<boolean> {
    // Check if the room exists:
    if (!(await this.hasGame(id))) {
      return false;
    }

    await this.redisAdapterService.closeRoom(`game:${id}`);
    await this.redisClientService.client.lrem('games:open', 0, id.toString());
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

  // If socket parameter is undefined, send to whole lobby
  async updateLobbyGames(socket?: SocketUser) {
    this.logger.log('Updating lobby games');
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

    const lobbyGames: LobbyRoomData[] = [];
    gameStrings.forEach((gameString) => {
      if (gameString) {
        lobbyGames.push(new Room(gameString).getLobbyRoomData());
      }
    });

    if (socket) {
      socket.emit(LobbySocketEvents.UPDATE_LOBBY_ROOMS, lobbyGames);
    } else {
      this.redisAdapterService.server
        .to('lobby')
        .emit(LobbySocketEvents.UPDATE_LOBBY_ROOMS, lobbyGames);
    }
  }

  async sendRoomDataToUser(socket: SocketUser, id: number) {
    const gameString = await this.redisClientService.client.get(`game:${id}`);

    if (!gameString) {
      return;
    }

    const room = new Room(gameString);
    room.sendRoomDataToSocket(socket);
  }

  // Fetch the game, parse it in, then forward the event
  async roomEvent(
    socket: SocketUser,
    gameId: number,
    event: RoomSocketEvents,
    data?: any,
  ) {
    await this.redisClientService.lockDo(
      `game:${gameId}`,
      async (client, multi) => {
        // Get the string of the game
        const gameString = await client.get(`game:${gameId}`);

        if (!gameString) {
          this.logger.warn(
            `RoomEvent requested game that doesn't exist: ${gameId}`,
          );
          return;
        }

        // Create the room and pass in the event
        const room = new Room(gameString);
        room.roomEvent(socket, event, data);

        // Save the game
        multi.set(`game:${gameId}`, JSON.stringify(room.getState()));

        room.sendRoomDataToAll(this.redisAdapterService);
      },
    );
  }
}
