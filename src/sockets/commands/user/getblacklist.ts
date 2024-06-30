import { Command } from '../types';
import { SocketUser } from '../../types';
import { sendReplyToCommand } from '../../sockets';

export const getblacklist: Command = {
  command: 'getblacklist',
  help: '/getblacklist: Shows your current blacklist for matchmaking. Will not match you into these players.',
  run: async (args: string[], socket: SocketUser) => {
    const user = socket.request.user;

    if (user.matchmakingBlacklist.length === 0) {
      sendReplyToCommand(socket, 'Your blacklist is currently empty.');
      return;
    }

    sendReplyToCommand(socket, 'Your blacklist:');

    for (const username of user.matchmakingBlacklist) {
      sendReplyToCommand(socket, username);
    }
  },
};
