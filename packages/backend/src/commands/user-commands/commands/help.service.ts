import { Injectable } from '@nestjs/common';
import { SocketUser } from '../../../users/users.socket';
import { emitCommandResponse } from '../../commandResponse';
import { Command, Commands } from '../../commands.types';
import UserCommandsService from '../user-commands.service';

@Injectable()
export class HelpService implements Command {
  command = 'help';
  help = '/help: shows the available commands and usage.';
  private userCommands: Commands;

  constructor(private readonly userCommandsService: UserCommandsService) {
    this.userCommands = this.userCommandsService.commands;
  }

  async run(senderSocket: SocketUser, _data: string[]) {
    emitCommandResponse('User commands are:', senderSocket);
    emitCommandResponse(this.help, senderSocket);
    Object.keys({ ...this.userCommands }).forEach((key) => {
      emitCommandResponse(this.userCommands[key].help, senderSocket);
    });
  }
}

export default HelpService;
