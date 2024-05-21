import { Command } from '../types';
import { sendReplyToCommand } from '../../sockets';
import { SocketUser } from '../../types';
import User from '../../../models/user';
import { S3Agent } from '../../../clients/s3/S3Agent';
import S3Controller from '../../../clients/s3/S3Controller';

export const mpushavatartolibrary: Command = {
  command: 'mpushavatartolibrary',
  help: "/mpushavatartolibrary <player name> <avatar id>: Add an approved avatar ID to a user's avatar library. It will remove the oldest avatar in their library if the max avatar library size has been exceeded.",
  async run(args: string[], senderSocket: SocketUser) {
    if (args.length !== 3) {
      sendReplyToCommand(senderSocket, 'Please specify <username> <avatar id>');
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

    const toBeAddedAvatarId = Number(args[2]);
    const s3Agent = new S3Agent(new S3Controller());
    const approvedIds = await s3Agent.getApprovedAvatarIdsForUser(
      usernameLower,
    );

    if (isNaN(toBeAddedAvatarId) || !approvedIds.includes(toBeAddedAvatarId)) {
      sendReplyToCommand(
        senderSocket,
        `Invalid avatar ID received. List of valid IDs: ${approvedIds}`,
      );
      return;
    }

    if (user.avatarLibrary.includes(toBeAddedAvatarId)) {
      sendReplyToCommand(
        senderSocket,
        `Avatar ID already exists in user's library: [${user.avatarLibrary}]`,
      );
      return;
    }

    // TODO-kev: Note the below has been changed to allow unlimited pushes. Idea is when a users patreon
    // is refreshed next, the library will be adjusted accordingly. See if this is a good idea
    user.avatarLibrary.push(toBeAddedAvatarId);
    user.markModified('avatarLibrary');
    await user.save();

    sendReplyToCommand(
      senderSocket,
      `Successfully updated ${usernameLower}'s avatar library: [${user.avatarLibrary}]`,
    );
    return;
  },
};
