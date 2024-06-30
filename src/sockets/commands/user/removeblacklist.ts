import { Command } from '../types';
import { SocketUser } from '../../types';
import { sendReplyToCommand } from '../../sockets';

export const removeblacklist: Command = {
  command: 'removeblacklist',
  help: '/removeblacklist <username>: Removes a user from your blacklist.',
  run: async (args: string[], socket: SocketUser) => {
    if (args.length < 2) {
      sendReplyToCommand(socket, 'Please specify a username.');
      return;
    }

    const usernameToBlacklist = args[1].toLowerCase();
    const user = socket.request.user;

    const index = user.matchmakingBlacklist.indexOf(usernameToBlacklist);
    if (index === -1) {
      sendReplyToCommand(
        socket,
        `${usernameToBlacklist} was not on your blacklist.`,
      );
      return;
    }
    user.matchmakingBlacklist.splice(index, 1);
    socket.request.user.markModified('matchmakingBlacklist');
    await socket.request.user.save();

    sendReplyToCommand(
      socket,
      `Removed ${usernameToBlacklist} from your blacklist.`,
    );
    return;
  },
};
