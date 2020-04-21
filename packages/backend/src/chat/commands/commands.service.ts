import { Injectable } from '@nestjs/common';
import { SocketUser } from '../../users/users.socket';
import UserCommands from './user-commands/user-commands';
import ModCommands from './mod-commands/mod-commands';
import AdminCommands from './admin-commands/admin-commands';
import { Command } from './commands.types';
import RedisAdapter from '../../redis-adapter/redis-adapter.service';
import {
  SocketEvents,
  ChatResponseType,
  ChatResponse,
} from '../../../proto/lobbyProto';

const allCommands: Record<string, Command> = {
  ...UserCommands,
  ...ModCommands,
  ...AdminCommands,
};

@Injectable()
export class CommandsService {
  constructor(private redisAdapter: RedisAdapter) {}

  runCommand(text: string, senderSocket: SocketUser) {
    // Get first word excluding the initial slash
    const splitted = text.split(' ');
    const command = splitted[0].substring(1);

    // Remove the command from the splitted to then give to the command.
    splitted.shift();

    // console.log(Object.keys(allCommands));

    if (allCommands[command]) {
      allCommands[command].run(splitted, senderSocket, this.redisAdapter);
    } else {
      const res: ChatResponse = {
        text: `Invalid command: ${text}`,
        timestamp: new Date(),
        type: ChatResponseType.USER_COMMAND,
        username: senderSocket.user.username,
      };

      senderSocket.emit(SocketEvents.ALL_CHAT_TO_CLIENT, res);
    }
  }
}
