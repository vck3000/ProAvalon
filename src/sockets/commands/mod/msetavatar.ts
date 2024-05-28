import { Command } from '../types';
import { sendReplyToCommand } from '../../sockets';
import { SocketUser } from '../../types';
import userAdapter, { UserNotFoundError } from '../../../databaseAdapters/user';
import { InvalidLinkError } from '../../../clients/s3/S3Agent';

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

    const username = args[1];
    const resLink = args[2];
    const spyLink = args[3];

    try {
      await userAdapter.updateAvatar(username, resLink, spyLink);

      sendReplyToCommand(
        senderSocket,
        `Successfully changed avatars for user: ${username}.`,
      );
    } catch (e) {
      if (e instanceof UserNotFoundError || e instanceof InvalidLinkError) {
        sendReplyToCommand(senderSocket, `Error: ${e.message}`);
      } else {
        throw e;
      }
    }
  },
};
