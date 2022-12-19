import { Command } from '../types';
import { modCommands } from './index';
import { modCommands as modCommandsSocket } from '../../sockets';

export const m: Command = {
  command: 'm',
  help: '/m: show moderator commands.',
  run: async (data, senderSocket) => {
    const dataToSend = [];
    let i = 0;
    i++;

    for (const key in modCommands) {
      if (modCommands.hasOwnProperty(key)) {
        dataToSend[i] = {
          message: modCommands[key].help,
          classStr: 'server-text',
        };
        i++;
      }
    }

    // TODO remove this when all the stuff is migrated out.
    for (const key in modCommandsSocket) {
      if (modCommandsSocket.hasOwnProperty(key)) {
        dataToSend[i] = {
          // @ts-ignore
          message: modCommandsSocket[key].help,
          classStr: 'server-text',
        };
        i++;
      }
    }

    senderSocket.emit('messageCommandReturnStr', dataToSend);  },
};
