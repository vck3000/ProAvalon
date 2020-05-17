import { Injectable } from '@nestjs/common';
import { SocketUser } from '../../../users/users.socket';
import { emitCommandResponse } from '../../commandResponse';
import { Command, Commands } from '../../commands.types';
import ModCommandsService from '../mod-commands.service';

@Injectable()
class MHelpService implements Command {
  command = 'm';
  help = '/m: shows the available mod commands and usage.';
  private modCommands: Commands;

  constructor(private readonly modCommandsService: ModCommandsService) {
    this.modCommands = this.modCommandsService.commands;
  }

  async run(socket: SocketUser) {
    emitCommandResponse('Mod commands are:', socket);
    emitCommandResponse(this.help, socket);
    Object.keys({ ...this.modCommands }).forEach((key) => {
      emitCommandResponse(this.modCommands[key].help, socket);
    });
  }
}

export default MHelpService;
