import { Injectable } from '@nestjs/common';
import { GamesService } from '../../../games/games.service';
import { SocketUser } from '../../../users/users.socket';
import { Command } from '../../commands.types';
import { emitCommandResponse } from '../../commandResponse';

@Injectable()
export class CreateRoomService implements Command {
  command = 'createroom';
  help = "/createroom: Creates a room and returns the new room's id";

  constructor(private readonly gamesService: GamesService) {}

  async run(senderSocket: SocketUser) {
    emitCommandResponse(
      `Created room ${await this.gamesService.createGame()}`,
      senderSocket,
    );
  }
}
