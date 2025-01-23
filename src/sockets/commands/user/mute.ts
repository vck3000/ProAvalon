import { Command } from '../types';
import { SocketUser } from '../../types';
import { sendReplyToCommand } from '../../sockets';
import mongoDbAdapter from '../../../databaseAdapters/mongoose';

export const mute: Command = {
  command: 'mute',
  help: '/mute: Mute a player who is being annoying in chat/buzzing/slapping/poking/tickling/hugging you.',
  run: async (args: string[], socket: SocketUser) => {
    if (args.length != 2) {
      sendReplyToCommand(socket, 'Please specify a single username.');
      return;
    }

    const userCallingMute = await mongoDbAdapter.user.getUser(
      socket.request.user.username,
    );
    const usernameToMuteLower = args[1].toLowerCase();

    if (userCallingMute.usernameLower === usernameToMuteLower) {
      sendReplyToCommand(socket, 'You cannot mute yourself.');
      return;
    }

    if (
      userCallingMute.mutedPlayers &&
      userCallingMute.mutedPlayers.includes(usernameToMuteLower)
    ) {
      sendReplyToCommand(
        socket,
        `You have already muted ${usernameToMuteLower}.`,
      );
      return;
    }

    const userToMute = await mongoDbAdapter.user.getUser(usernameToMuteLower);

    if (!userToMute) {
      sendReplyToCommand(socket, `${usernameToMuteLower} was not found.`);
      return;
    }

    await mongoDbAdapter.user.muteUser(userCallingMute, usernameToMuteLower);

    socket.emit('updateMutedPlayers', userCallingMute.mutedPlayers);
    sendReplyToCommand(socket, `Muted ${usernameToMuteLower} successfully.`);
  },
};
