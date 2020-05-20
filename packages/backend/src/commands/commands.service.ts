import { Injectable } from '@nestjs/common';
import { Lobby } from '@proavalon/proto';
import SocketEvents = Lobby.SocketEvents;
import ChatResponse = Lobby.ChatResponse;
import ChatResponseType = Lobby.ChatResponseType;
import { SocketUser } from '../users/users.socket';
import { Commands } from './commands.types';

import UserCommandsService from './user-commands/user-commands.service';
import UserCommandsHelpService from './user-commands/commands/help.service';
import ModCommandsService from './mod-commands/mod-commands.service';
import ModCommandsHelpService from './mod-commands/commands/mhelp.service';
import AdminCommandsService from './admin-commands/admin-commands.service';
import AdminCommandsHelpService from './admin-commands/commands/ahelp.service';

@Injectable()
export class CommandsService {
  allCommands: Commands;

  constructor(
    private readonly userCommandsService: UserCommandsService,
    private readonly userCommandsHelpService: UserCommandsHelpService,
    private readonly modCommandsService: ModCommandsService,
    private readonly modCommandsHelpService: ModCommandsHelpService,
    private readonly adminCommandsService: AdminCommandsService,
    private readonly adminCommandsHelpService: AdminCommandsHelpService,
  ) {
    this.allCommands = {
      ...this.userCommandsService.commands,
      [this.userCommandsHelpService.command]: this.userCommandsHelpService,
      ...this.modCommandsService.commands,
      [this.modCommandsHelpService.command]: this.modCommandsHelpService,
      ...this.adminCommandsService.commands,
      [this.adminCommandsHelpService.command]: this.adminCommandsHelpService,
    };
  }

  runCommand(text: string, socket: SocketUser) {
    // Get first word excluding the initial slash
    const splitted = text.split(' ');
    const command = splitted[0].substring(1);

    // Remove the command from the splitted to then give to the command.
    splitted.shift();

    // TODO: Only allow mod and admin commands if the user is authorized

    if (this.allCommands[command]) {
      this.allCommands[command].run(socket, splitted);
    } else {
      const res: ChatResponse = {
        text: `Invalid command: ${text}`,
        timestamp: new Date(),
        type: ChatResponseType.USER_COMMAND,
        username: socket.user.username,
      };

      socket.emit(SocketEvents.ALL_CHAT_TO_CLIENT, res);
    }
  }
}
