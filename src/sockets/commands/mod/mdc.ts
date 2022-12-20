import { Command } from '../types';
import { allSockets, getIndexFromUsername } from '../../sockets';

export const mdc: Command = {
  command: 'mdc',
  help: '/mdc <player name>: Disconnect a player.',
  run: async (args, senderSocket) => {
    if (!args[1]) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Specify a username.',
        classStr: 'server-text',
      });
      return;
    }

    const targetSock =
      allSockets[getIndexFromUsername(allSockets, args[1], true)];

    if (targetSock) {
      targetSock.emit('redirect', '/logout');
      targetSock.disconnect();
      senderSocket.emit('messageCommandReturnStr', {
        message: `Disconnected ${args[1]} successfully.`,
        classStr: 'server-text',
      });
    } else {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Could not find username',
        classStr: 'server-text',
      });
    }
  },
};
