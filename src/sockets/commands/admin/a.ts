import { Command } from '../types';
import { adminCommands } from './index';
import { SocketUser } from '../../types';

export const a: Command = {
  command: 'a',
  help: '/a: ...shows mods commands',
  run: async (args: string[], socket: SocketUser) => {
    const dataToSend = [];

    for (const key in adminCommands) {
      if (adminCommands.hasOwnProperty(key)) {
        dataToSend.push({
          message: adminCommands[key].help,
          classStr: 'server-text',
        });
      }
    }

    socket.emit('messageCommandReturnStr', dataToSend);
  },
};
