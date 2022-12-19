import { Command } from '../types';
import Ban from '../../../models/ban';
import User from '../../../models/user';
import ModLog from '../../../models/modLog';

export const munban: Command = {
  command: 'munban',
  help: '/munban <username>: Removes the latest ban for a username.',
  run: async (args, senderSocket) => {
    if (!args[1]) {
      senderSocket.emit('messageCommandReturnStr', { message: 'Specify a username.', classStr: 'server-text' });
    }

    const ban = await Ban.findOne({
      'bannedPlayer.usernameLower': args[1].toLowerCase(),
      whenRelease: { $gt: new Date() },
      disabled: false,
    }).sort({ whenMade: 'descending' });

    if (ban) {
      ban.disabled = true;
      ban.markModified('disabled');
      await ban.save();

      // Create the ModLog
      const modUser = await User.findOne({
        // @ts-ignore
        usernameLower: senderSocket.request.user.username.toLowerCase(),
      });
      ModLog.create({
        type: 'munban',
        modWhoMade: {
          id: modUser._id,
          username: modUser.username,
          usernameLower: modUser.usernameLower,
        },
        data: ban,
        dateCreated: new Date(),
      });
      senderSocket.emit('messageCommandReturnStr', {
        message: `Successfully unbanned ${args[1]}'s latest ban. Their record still remains, however.`,
        classStr: 'server-text',
      });
    } else {
      senderSocket.emit('messageCommandReturnStr', {
        message: `Could not find a ban for ${args[1]}.`,
        classStr: 'server-text',
      });
    }
  },
};
