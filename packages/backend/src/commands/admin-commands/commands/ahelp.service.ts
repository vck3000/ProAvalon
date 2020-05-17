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

  async run(senderSocket: SocketUser) {
    emitCommandResponse('Admin commands are:', senderSocket);
    emitCommandResponse(this.help, senderSocket);
    Object.keys({ ...this.adminCommands }).forEach((key) => {
      emitCommandResponse(this.adminCommands[key].help, senderSocket);
    });
  }
}

export default AHelpService;
