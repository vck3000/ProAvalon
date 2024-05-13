import { Command } from '../types';
import { sendReplyToCommand } from '../../sockets';
import { SocketUser } from '../../types';
import User from '../../../models/user';
import { S3Agent } from '../../../s3/S3Agent';
import S3Controller from '../../../s3/S3Controller';

export const msetavatarlibrary: Command = {
  command: 'msetavatarlibrary',
  help: "/msetavatarlibrary <player name> <avatar ids>: Set <player name>'s avatar library.",
  async run(args: string[], senderSocket: SocketUser) {
    if (args.length !== 3) {
      sendReplyToCommand(
        senderSocket,
        'Please specify <username> <avatar ids>. Example: /msetavatarlibrary asdf 1,3,4',
      );
      return;
    }

    const usernameLower = args[1].toLowerCase();
    const user = await User.findOne({ usernameLower });

    if (!user) {
      sendReplyToCommand(
        senderSocket,
        `Invalid username. Could not find: ${usernameLower}`,
      );
      return;
    }

    const proposedAvatarLibrary: number[] = args[2]
      .split(',')
      .map(Number)
      .filter((number) => !isNaN(number));

    if (proposedAvatarLibrary.length === 0) {
      sendReplyToCommand(
        senderSocket,
        `Invalid avatar IDs received: ${args[2]}`,
      );
      return;
    }

    // TODO-kev: Add a check for max library size here. If proposed > max return
    const s3Agent = new S3Agent(new S3Controller());
    const approvedIds = await s3Agent.getApprovedAvatarIdsForUser(
      usernameLower,
    );
    const notFoundIds: number[] = [];

    proposedAvatarLibrary.forEach((id) => {
      if (!approvedIds.includes(id)) {
        notFoundIds.push(id);
      }
    });

    if (notFoundIds.length !== 0) {
      sendReplyToCommand(
        senderSocket,
        `Invalid avatar IDs received. List of valid IDs: ${approvedIds}`,
      );
      return;
    }

    user.avatarLibrary = proposedAvatarLibrary;
    user.markModified('approvedAvatarIds');
    await user.save();

    sendReplyToCommand(
      senderSocket,
      `Successfully updated ${usernameLower}'s avatar library: ${proposedAvatarLibrary}`,
    );
    return;
  },
};
