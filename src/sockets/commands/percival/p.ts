import { Command } from '../types';
import { SocketUser } from '../../types';
import { percivalCommands } from './index';

export const p: Command = {
  command: 'p',
  help: '/p: show percival commands.',
  run: async (args: string[], socket: SocketUser) => {
    const dataToSend = [];

    for (const key in percivalCommands) {
      if (percivalCommands.hasOwnProperty(key)) {
        const commandKey = key as keyof typeof percivalCommands;
        dataToSend.push({
          message: percivalCommands[commandKey].help,
          classStr: 'server-text',
        });
      }
    }

    socket.emit('messageCommandReturnStr', dataToSend);
  },
};
