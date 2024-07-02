import { Command } from '../types';
import { SocketUser } from '../../types';
import { sendReplyToCommand } from '../../sockets';
import userAdapter from '../../../databaseAdapters/user';

export const mute: Command = {
  command: 'mute',
  help: '/mute: Mute a player who is being annoying in chat/buzzing/slapping/poking/tickling/hugging you.',
  run: async (args: string[], socket: SocketUser) => {
    if (args.length != 2) {
      sendReplyToCommand(socket, 'Please specify a single username.');
      return;
    }

    const userCallingMute = await userAdapter.getUser(
      socket.request.user.username,
    );
    const usernameToMuteLower = args[1].toLowerCase();

    if (userCallingMute.usernameLower === usernameToMuteLower) {
      sendReplyToCommand(socket, 'You cannot mute yourself.');
      return;
    }

    // TODO-kev: Do all users have mutedPlayers array?
    // if (!userCallingMute.mutedPlayers) {
    //   userCallingMute.mutedPlayers = [];
    // }

    if (userCallingMute.mutedPlayers.includes(usernameToMuteLower)) {
      sendReplyToCommand(
        socket,
        `You have already muted ${usernameToMuteLower}.`,
      );
      return;
    }

    const userToMute = await userAdapter.getUser(usernameToMuteLower);

    if (!userToMute) {
      sendReplyToCommand(socket, `${usernameToMuteLower} was not found.`);
      return;
    }

    await userAdapter.muteUser(userCallingMute, usernameToMuteLower);

    socket.emit('updateMutedPlayers', userCallingMute.mutedPlayers);
    sendReplyToCommand(socket, `Muted ${usernameToMuteLower} successfully.`);
  },
};
