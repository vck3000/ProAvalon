import { Command } from '../types';
import { sendReplyToCommand } from '../../sockets';
import { SocketUser } from '../../types';
import User from '../../../models/user';

export const msetspyavatar: Command = {
  command: 'msetspyavatar',
  help: "/msetspyavatar <player name> <avatar spyLink>: Set <player name>'s spy avatar.",
  async run(args: string[], senderSocket: SocketUser) {
    if (args.length !== 3) {
      sendReplyToCommand(senderSocket, 'Please specify <username> <spyLink>.');
      return;
    }

    const usernameLower = args[1].toLowerCase();
    const spyLink = args[2];

    if (
      !spyLink.startsWith('https://s3.proavalon.com') &&
      !spyLink.includes('spy')
    ) {
      sendReplyToCommand(senderSocket, `Invalid spy avatar link provided`);
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

    user.avatarImgSpy = spyLink;
    await user.save();

    sendReplyToCommand(
      senderSocket,
      `Successfully changed spy avatar for user: ${usernameLower}.`,
    );
    return;
  },
};
