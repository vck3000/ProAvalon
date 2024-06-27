import { Command } from '../types';
import { SocketUser } from '../../types';
import { rooms, sendReplyToCommand } from '../../sockets';
import User from '../../../models/user';
import user from '../../../models/user';
import userAdapter from '../../../databaseAdapters/user';

export const mute: Command = {
  command: 'mute',
  help: '/mute: Mute a player who is being annoying in chat/buzzing/slapping/poking/tickling/hugging you.',
  run: async (args: string[], socket: SocketUser) => {
    if (args.length != 2) {
      sendReplyToCommand(socket, 'Please specify a single username.');
      return;
    }

    const userCallingMute = socket.request.user;
    const usernameToMuteLower = args[1].toLowerCase();

    if (userCallingMute.usernameLower === usernameToMuteLower) {
      sendReplyToCommand(socket, 'You cannot mute yourself.');
      return;
    }

    // TODO-kev: Do we even need this?
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

    await userAdapter.muteUser(
      userCallingMute.usernameLower,
      usernameToMuteLower,
    );

    socket.request.user.mutedPlayers.push(usernameToMuteLower);
    socket.request.user.markModified('mutedPlayers');
    await socket.request.user.save();

    console.log(socket.request.user.mutedPlayers);

    sendReplyToCommand(socket, `Muted ${usernameToMuteLower} successfully.`);
  },
};
