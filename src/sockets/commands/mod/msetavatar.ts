import { Command } from '../types';
import { sendReplyToCommand } from '../../sockets';
import { SocketUser } from '../../types';
import userAdapter from '../../../databaseAdapters/user';
import { S3Agent } from '../../../clients/s3/S3Agent';
import S3Controller from '../../../clients/s3/S3Controller';

const s3Agent = new S3Agent(new S3Controller());

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

    if (
      !s3Agent.isValidLink(resLink, 'res') ||
      !s3Agent.isValidLink(spyLink, 'spy')
    ) {
      sendReplyToCommand(senderSocket, `Invalid avatar links provided.`);
    }

    const user = await userAdapter.getUser(username);
    if (!user) {
      sendReplyToCommand(
        senderSocket,
        `Invalid username. Could not find: ${username}.`,
      );
    }

    await userAdapter.updateAvatar(username, resLink, spyLink);
    sendReplyToCommand(
      senderSocket,
      `Successfully changed avatars for user: ${username}.`,
    );
  },
};
