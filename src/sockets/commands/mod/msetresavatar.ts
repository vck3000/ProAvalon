import { Command } from '../types';
import { sendReplyToCommand } from '../../sockets';
import { SocketUser } from '../../types';
import User from '../../../models/user';

export const msetresavatar: Command = {
  command: 'msetresavatar',
  help: "/msetavatar <player name> <avatar resLink>: Set <player name>'s resistance avatar.",
  async run(args: string[], senderSocket: SocketUser) {
    if (args.length !== 3) {
      sendReplyToCommand(senderSocket, 'Please specify <username> <resLink>.');
      return;
    }

    const usernameLower = args[1].toLowerCase();
    const resLink = args[2];

    if (
      !resLink.startsWith('https://s3.proavalon.com') &&
      !resLink.includes('res')
    ) {
      sendReplyToCommand(
        senderSocket,
        `Invalid resistance avatar link provided`,
      );
      return;
    }

    const user = await User.findOne({ usernameLower });

    if (!user) {
      sendReplyToCommand(
        senderSocket,
        `Invalid username. Could not find: ${usernameLower}`,
      );
      return;
    }

    user.avatarImgRes = resLink;
    await user.save();

    sendReplyToCommand(
      senderSocket,
      `Successfully changed resistance avatar for user: ${usernameLower}.`,
    );
    return;
  },
};
