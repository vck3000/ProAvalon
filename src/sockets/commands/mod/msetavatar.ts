import { Command } from '../types';
import { sendReplyToCommand } from '../../sockets';
import { SocketUser } from '../../types';
import User from '../../../models/user';

export const msetavatar: Command = {
  command: 'msetavatar',
  help: "/msetavatar <player name> <avatar resLink> <avatar spyLink>: Set a <player name>'s resistance and spy avatars.",
  async run(args: string[], senderSocket: SocketUser) {
    if (args.length !== 4) {
      sendReplyToCommand(
        senderSocket,
        'Please specify <username> <resLink> <spyLink>.',
      );
      return;
    }

    const usernameLower = args[1].toLowerCase();
    const resLink = args[2];
    const spyLink = args[3];

    if (
      (!resLink.startsWith(process.env.S3_PUBLIC_FILE_LINK_PREFIX) &&
        !resLink.includes('res')) ||
      (!spyLink.startsWith(process.env.S3_PUBLIC_FILE_LINK_PREFIX) &&
        !spyLink.includes('spy'))
    ) {
      sendReplyToCommand(senderSocket, `Invalid avatar links provided`);
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
    user.avatarImgSpy = spyLink;
    await user.save();

    sendReplyToCommand(
      senderSocket,
      `Successfully changed avatars for user: ${usernameLower}.`,
    );
  },
};
