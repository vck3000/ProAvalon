import { Command } from '../types';
import User from '../../../models/user';

export const mremoveavatar: Command = {
  command: 'mremoveavatar',
  help: '/mremoveavatar <player name>: Remove <player name>\'s avatar.',
  async run(args, senderSocket) {
    if (!args[1]) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Specify a username.',
        classStr: 'server-text',
      });
      return;
    }

    User.findOne({ usernameLower: args[1].toLowerCase() })
      .populate('notifications')
      .exec((err, foundUser) => {
        if (err) {
          console.log(err);
        } else if (foundUser !== undefined) {
          foundUser.avatarImgRes = null;
          foundUser.avatarImgSpy = null;
          foundUser.save();

          senderSocket.emit('messageCommandReturnStr', {
            message: `Successfully removed ${args[1]}'s avatar.`,
            classStr: 'server-text',
          });
        } else {
          senderSocket.emit('messageCommandReturnStr', {
            message: `Could not find ${args[1]}'s avatar.`,
            classStr: 'server-text',
          });
        }
      });
  },
};