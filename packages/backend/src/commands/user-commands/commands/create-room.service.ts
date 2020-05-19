import { Injectable } from '@nestjs/common';
import {
  transformAndValidate,
  CreateGameDto,
  GameMode,
} from '@proavalon/proto';
import { GamesService } from '../../../games/games.service';
import { SocketUser } from '../../../users/users.socket';
import { Command } from '../../commands.types';
import { emitCommandResponse } from '../../commandResponse';

@Injectable()
export class CreateRoomService implements Command {
  command = 'create';
  help = "/create: Creates a game and returns the new room's id";

  constructor(private readonly gamesService: GamesService) {}

  async run(socket: SocketUser) {
    const settings: CreateGameDto = {
      gameMode: GameMode.AVALON,
      joinPassword: undefined,
      maxNumPlayers: 9,
    };

    const data = await transformAndValidate(CreateGameDto, settings);

    emitCommandResponse(
      `Created room ${await this.gamesService.createGame(socket, data)}`,
      socket,
    );
  }
}
