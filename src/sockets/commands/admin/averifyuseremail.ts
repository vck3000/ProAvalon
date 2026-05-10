import { sendReplyToCommand } from '../../sockets';
import { SocketUser } from '../../types';
import User from '../../../models/user';
import { Command } from '../types';

export const averifyuseremail: Command = {
  command: 'averifyuseremail',
  help: "/averifyuseremail <username>: set a user's emailVerified field to true",
  run: async (args: string[], socket: SocketUser) => {
    if (args.length < 2) {
      sendReplyToCommand(socket, 'Specify a username.');
      return;
    }

    const username = args[1];

    const user = await User.findOne({
      usernameLower: username.toLowerCase(),
    });

    if (!user) {
      sendReplyToCommand(socket, `Could not find user ${username}.`);
      return;
    }

    if (user.emailVerified) {
      sendReplyToCommand(
        socket,
        `${user.username}'s email is already verified.`,
      );
      return;
    }

    user.emailVerified = true;
    user.markModified('emailVerified');
    await user.save();

    sendReplyToCommand(
      socket,
      `${user.username}'s email has been marked as verified.`,
    );
  },
};
