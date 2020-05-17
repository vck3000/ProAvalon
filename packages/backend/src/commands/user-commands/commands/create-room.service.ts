import { Injectable } from '@nestjs/common';
import { GamesService } from '../../../games/games.service';
import { SocketUser } from '../../../users/users.socket';
import { Command } from '../../commands.types';
import { emitCommandResponse } from '../../commandResponse';

@Injectable()
export class CreateRoomService implements Command {
  command = 'creategame';
  help = "/creategame: Creates a room and returns the new room's id";

  constructor(private readonly gamesService: GamesService) {}

  async run(socket: SocketUser) {
    emitCommandResponse(
      `Created room ${await this.gamesService.createGame()}`,
      socket,
    );
  }
}
