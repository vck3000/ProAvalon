import { Injectable } from '@nestjs/common';
import { SocketUser } from '../../../users/users.socket';
import { emitCommandResponse } from '../../commandResponse';
import { Command, Commands } from '../../commands.types';
import AdminCommandsService from '../admin-commands.service';

@Injectable()
class AHelpService implements Command {
  command = 'a';
  help = '/a: shows the available admin commands and usage.';
  private adminCommands: Commands;

  constructor(private readonly adminCommandsService: AdminCommandsService) {
    this.adminCommands = this.adminCommandsService.commands;
  }

  async run(socket: SocketUser) {
    emitCommandResponse('Admin commands are:', socket);
    emitCommandResponse(this.help, socket);
    Object.keys({ ...this.adminCommands }).forEach((key) => {
      emitCommandResponse(this.adminCommands[key].help, socket);
    });
  }
}

export default AHelpService;
