import { Command } from '../types';
import { SocketUser } from '../../types';
import { sendReplyToCommand } from '../../sockets';
import userAdapter from '../../../databaseAdapters/user';

export const unmute: Command = {
  command: 'unmute',
  help: '/unmute: Unmute a player.',
  run: async (args: string[], socket: SocketUser) => {
    if (args.length != 2) {
      sendReplyToCommand(socket, 'Please specify a single username.');
      return;
    }

    const userCallingUnmute = await userAdapter.getUser(
      socket.request.user.username,
    );
    const usernameToUnmuteLower = args[1].toLowerCase();

    if (!userCallingUnmute.mutedPlayers.includes(usernameToUnmuteLower)) {
      sendReplyToCommand(
        socket,
        `You have not muted ${usernameToUnmuteLower}. Cannot unmute.`,
      );
      return;
    }

    const userToMute = await userAdapter.getUser(usernameToUnmuteLower);

    if (!userToMute) {
      sendReplyToCommand(socket, `${usernameToUnmuteLower} was not found.`);
      return;
    }

    await userAdapter.unmuteUser(userCallingUnmute, usernameToUnmuteLower);

    socket.emit('updateMutedPlayers', userCallingUnmute.mutedPlayers);
    sendReplyToCommand(
      socket,
      `Unmuted ${usernameToUnmuteLower} successfully.`,
    );
  },
};
