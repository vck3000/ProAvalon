import { SocketUser } from '../../../../users/users.socket';
import { emitChatResponse } from '../../chatResponse';
import { userInteractions } from './userInteractions';
import { Command } from '../../commands.types';
import userActions from '../user-commands';

export const Help: Command = {
  command: 'help',

  help: '/help: shows the available commands and usage.',

  run: (_data: string[], senderSocket: SocketUser) => {
    emitChatResponse('User commands are:', senderSocket);
    Object.keys({ ...userActions, ...userInteractions }).forEach((key) => {
      emitChatResponse(userActions[key].help, senderSocket);
      emitChatResponse(userInteractions[key].help, senderSocket);
    });
  },
};

export default Help;
