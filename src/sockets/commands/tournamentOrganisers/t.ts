import { Command } from '../types';
import { SocketUser } from '../../types';
import { TOCommands } from './index';

export const t: Command = {
  command: 't',
  help: '/t: show Tournament Organizer commands.',
  run: async (args: string[], socket: SocketUser) => {
    const dataToSend = [];

    for (const key in TOCommands) {
      if (TOCommands.hasOwnProperty(key)) {
        const commandKey = key as keyof typeof TOCommands;
        dataToSend.push({
          message: TOCommands[commandKey].help,
          classStr: 'server-text',
        });
      }
    }

    socket.emit('messageCommandReturnStr', dataToSend);
  },
};
