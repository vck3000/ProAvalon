import { Command } from '../types';
import { SocketUser } from '../../types';
import { sendReplyToCommand } from '../../sockets';

export const addblacklist: Command = {
  command: 'addblacklist',
  help: '/addblacklist <username>: Adds a user to your blacklist. Maximum of 50 users.',
  run: async (args: string[], socket: SocketUser) => {
    if (args.length < 2) {
      sendReplyToCommand(socket, 'Please specify a username.');
      return;
    }

    const usernameToBlacklist = args[1].toLowerCase();
    const user = socket.request.user;

    if (user.username === usernameToBlacklist) {
      sendReplyToCommand(socket, 'You cannot blacklist yourself.');
      return;
    }

    if (user.matchmakingBlacklist.length > 50) {
      sendReplyToCommand(
        socket,
        'You have too many users. Please remove some.',
      );
      return;
    }

    if (user.matchmakingBlacklist.includes(usernameToBlacklist)) {
      sendReplyToCommand(
        socket,
        `You already have ${usernameToBlacklist} on your blacklist.`,
      );
      return;
    }

    user.matchmakingBlacklist.push(usernameToBlacklist);
    user.markModified('matchmakingBlacklist');
    await user.save();
    sendReplyToCommand(
      socket,
      `Added ${usernameToBlacklist} to your blacklist.`,
    );
    return;
  },
};
