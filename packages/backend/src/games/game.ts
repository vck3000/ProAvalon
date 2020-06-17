import { Logger } from '@nestjs/common';
import {
  transformAndValidate,
  transformAndValidateSync,
} from '@proavalon/proto';
import {
  CreateGameDto,
  LobbyGame,
  MissionOutcome,
  GameData,
  GameState,
  GameRoomState,
} from '@proavalon/proto/game';
import { SocketUser } from '../users/users.socket';

import GameECS from './game-ecs';

const test = new GameECS();
console.log(test);

const gameLogger = new Logger('Game');

export default class Game {
  private readonly logger: Logger;

  private data: GameData;

  constructor(gameString: string) {
    this.logger = new Logger(Game.name);
    this.data = transformAndValidateSync(
      GameData,
      JSON.parse(gameString) as GameData,
    );
  }

  // ----------- Static methods -------------
  static async createNewGameState(
    socket: SocketUser,
    data: CreateGameDto,
    id: number,
  ): Promise<GameData | null> {
    const settingsJSON: GameData = {
      ...data,
      id,
      host: socket.user.displayUsername,
      roomState: GameRoomState.WAITING,
      kickedPlayers: [],
      claimingPlayers: [],
      playerUsernames: [],
      roles: {},
      state: GameState.PICKING,
      data: {},
      history: [],
    };

    const settings = await transformAndValidate(GameData, settingsJSON);
    gameLogger.log('Passed validation');
    gameLogger.log(settings);
    return settings;
  }

  // ----------- Instance methods -------------
  getChat() {
    this.logger.log('Getting full chat...');
    // Fetch from redis database
  }

  getMissionHistory(): MissionOutcome[] {
    return [MissionOutcome.success, MissionOutcome.fail];
  }

  getLobbyData(): LobbyGame {
    const lobbyGame: LobbyGame = {
      id: this.data.id,
      host: this.data.host,
      mode: this.data.mode,
      missionHistory: this.getMissionHistory(),
      spectators: 8,
      avatarLinks: [
        'https://cdn.discordapp.com/attachments/430166478193688597/481009331622510602/pronub-res.png',
        '/game_room/base-res.png',
        '/game_room/base-res.png',
        '/game_room/base-res.png',
        '/game_room/base-res.png',
        '/game_room/base-res.png',
        '/game_room/base-res.png',
      ],
    };

    return lobbyGame;
  }
}
