import { Injectable } from '@nestjs/common';
import { transformAndValidate } from '@proavalon/proto';
import { CreateRoomDto, GameMode } from '@proavalon/proto/room';
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
    const settings: CreateRoomDto = {
      mode: GameMode.AVALON,
      joinPassword: undefined,
      maxNumPlayers: 9,
    };

    const data = await transformAndValidate(CreateRoomDto, settings);

    emitCommandResponse(
      `Created room ${await this.gamesService.createGame(socket, data)}`,
      socket,
    );
  }
}
