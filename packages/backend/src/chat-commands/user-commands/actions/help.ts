import { SocketUser } from '../../../users/users.socket';
import { emitChatResponse } from '../../chatResponse';
import { userInteractions } from './userInteractions';
import { userActions } from './userActions';
import { UserCommand } from '../interfaces/user-commands.interface';

export class Help implements UserCommand {
  command: string;

  help: string;

  constructor(command: string) {
    this.command = command;
    this.help = '/help: ...shows help.';
  }

  run(_data: string[], senderSocket: SocketUser) {
    emitChatResponse('User commands are:', senderSocket);
    Object.keys({ ...userActions, ...userInteractions }).forEach((key) => {
      emitChatResponse(userActions[key].help, senderSocket);
      emitChatResponse(userInteractions[key].help, senderSocket);
    });
  }
}

export default Help;
