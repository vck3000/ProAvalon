import { sendReplyToCommand } from '../../sockets';
import { SocketUser } from '../../types';
import User from '../../../models/user';
import { Command } from '../types';

export const aemailtousername: Command = {
  command: 'aemailtousername',
  help: '/aemailtousername <email>: lookup a username from their email',
  run: async (args: string[], socket: SocketUser) => {
    if (args.length < 2) {
      sendReplyToCommand(socket, 'Specify an email address.');
      return;
    }

    const email = args[1];

    const user = await User.findOne({
      emailAddress: email.toLowerCase(),
    });

    if (!user) {
      sendReplyToCommand(socket, `${email} is not tied to a user.`);
      return;
    }

    sendReplyToCommand(socket, `${email} is tied with ${user.username}.`);
  },
};
