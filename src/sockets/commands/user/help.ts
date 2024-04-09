import { Command } from '../types';
import { SocketUser } from '../../types';
import { userCommands } from '../../sockets';

export const help: Command = {
  command: 'help',
  help: '/help: ...shows help',
  run: async (args: string[], socket: SocketUser) => {
    const dataToSend = [];

    for (const key in userCommands) {
      if (userCommands.hasOwnProperty(key)) {
        const commandKey = key as keyof typeof userCommands;
        dataToSend.push({
          message: userCommands[commandKey].help,
          classStr: 'server-text',
        });
      }
    }

    socket.emit('messageCommandReturnStr', dataToSend);
  },
};
