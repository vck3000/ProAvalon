import { Command } from '../types';
import { SocketUser } from '../../types';
import { sendReplyToCommand } from '../../sockets';

export const navbar: Command = {
  command: 'navbar',
  help: '/navbar: Hides and unhides the top navbar. Some phone screens may look better with the navbar turned off.',
  run: async (args: string[], socket: SocketUser) => {
    socket.emit('toggleNavBar');
  },
};
