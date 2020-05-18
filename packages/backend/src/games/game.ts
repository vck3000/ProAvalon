import { Logger } from '@nestjs/common';
import { transformAndValidate } from 'class-transformer-validator';
import { GameState, GameRoomState, GameStateType } from './types';
import { SocketUser } from '../users/users.socket';
import { CreateGameDto } from '../../proto/lobbyProto';

export default class Game {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger(Game.name);
  }

  getChat() {
    this.logger.log('Getting full chat...');
    // Fetch from redis database
  }

  async createNewGameState(
    socket: SocketUser,
    data: CreateGameDto,
    id: number,
  ): Promise<GameState | null> {
    const settingsJSON: GameState = {
      ...data,
      id,
      host: socket.user.displayUsername,
      roomState: GameRoomState.WAITING,
      kickedPlayers: [],
      claimingPlayers: [],
      playerUsernames: [],
      roles: {},
      state: GameStateType.PICKING,
      data: {},
      missionHistory: [],
      numFailsHistory: [],
    };

    const settings = await transformAndValidate(GameState, settingsJSON);
    this.logger.log('Passed validation');
    this.logger.log(settings);
    return settings;
  }
}
