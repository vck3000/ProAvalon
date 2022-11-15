import { sendReplyToCommand } from '../../sockets/sockets';
import { SocketUser } from '../../sockets/types';
import User from '../../models/user';

export const aemailtousername = {
  command: 'aemailtousername',
  help: "/aemailtousername <email>: lookup a username from their email",
  async run(data: { args: string[] }, socket: SocketUser) {
    const { args } = data;

    const email = args[1];

    if (!email) {
      sendReplyToCommand(socket, 'Specify an email address');
      return;
    }

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