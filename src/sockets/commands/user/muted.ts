import { Command } from '../types';
import { SocketUser } from '../../types';
import { sendReplyToCommand } from '../../sockets';
import { userAdapter } from '../../../databaseAdapters/mongoose';

export const muted: Command = {
  command: 'muted',
  help: '/muted: See who you have muted.',
  run: async (args: string[], socket: SocketUser) => {
    if (args.length != 1) {
      sendReplyToCommand(
        socket,
        'Invalid usage. Please use /muted without any additional arguments.',
      );
      return;
    }

    const user = await userAdapter.getUser(socket.request.user.username);

    if (user.mutedPlayers.length === 0) {
      sendReplyToCommand(socket, 'You have no muted players.');
      return;
    } else {
      sendReplyToCommand(socket, `You have muted:`);
      user.mutedPlayers.forEach((mutedUsername) => {
        sendReplyToCommand(socket, `- ${mutedUsername}`);
      });
    }
  },
};
