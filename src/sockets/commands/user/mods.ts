import { Command } from '../types';
import { SocketUser } from '../../types';
import { allSockets, sendReplyToCommand } from '../../sockets';
import { isMod } from '../../../modsadmins/mods';

export const mods: Command = {
  command: 'mods',
  help: '/mods: Shows a list of online moderators.',
  run: async (args: string[], socket: SocketUser) => {
    if (args.length != 1) {
      sendReplyToCommand(
        socket,
        'Invalid usage. Please use /mods without any additional arguments.',
      );
      return;
    }

    const modUsernames = allSockets
      .filter((socket) => isMod(socket.request.user.username))
      .map((socket) => socket.request.user.username);

    const msg = `Currently online mods: ${
      modUsernames.length > 0 ? modUsernames.join(', ') : 'None'
    }.`;

    sendReplyToCommand(socket, msg);
  },
};
