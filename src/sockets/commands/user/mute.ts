import { Command } from '../types';
import { SocketUser } from '../../types';
import { rooms, sendReplyToCommand } from '../../sockets';
import User from '../../../models/user';
import user from '../../../models/user';

export const mute: Command = {
  command: 'mute',
  help: '/mute: Mute a player who is being annoying in chat/buzzing/slapping/poking/tickling/hugging you.',
  run: async (args: string[], socket: SocketUser) => {
    if (args.length != 2) {
      sendReplyToCommand(socket, 'Please specify a single username.');
      return;
    }

    const userCallingMute = socket.request.user;
    const usernameToMute = args[1];

    if (userCallingMute.username === usernameToMute) {
      sendReplyToCommand(socket, 'You cannot mute yourself.');
      return;
    }

    const userToMute = await User.findOne({ username: args[1].toLowerCase() });

    if (userToMute === null) {
      sendReplyToCommand(socket, `${usernameToMute} was not found.`);
      return;
    }

    // TODO: Do we even need this?
    // if (!userCallingMute.mutedPlayers) {
    //   userCallingMute.mutedPlayers = [];
    // }

    console.log(userCallingMute.mutedPlayers.includes(userToMute.username));
    console.log(userCallingMute.mutedPlayers);

    if (userCallingMute.mutedPlayers.includes(userToMute.username)) {
      sendReplyToCommand(socket, `You have already muted ${usernameToMute}.`);
    } else {
      userCallingMute.mutedPlayers.push(userToMute.username);
      userCallingMute.markModified('mutedPlayers');
      await userCallingMute.save();
      sendReplyToCommand(socket, `Muted ${usernameToMute} successfully.`);
    }
  },
};
