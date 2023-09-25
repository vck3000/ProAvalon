import { sendReplyToCommand } from '../../sockets';
import { SocketUser } from '../../types';
import User from '../../../models/user';
import { Command } from '../types';

export const ausernametoemail: Command = {
  command: 'ausernametoemail',
  help: '/ausernametoemail <username>: lookup an email from a username',
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

    sendReplyToCommand(
      socket,
      `${user.username}'s email address is '${user.emailAddress}'.`,
    );
  },
};
