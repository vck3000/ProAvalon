import { Command } from '../types';
import User from '../../../models/user';
import { createNotification } from '../../../myFunctions/createNotification';
import ModLog from '../../../models/modLog';

export const mnotify: Command = {
  command: 'mnotify',
  help: '/mnotify <player name> <text to leave for player>: Leaves a message for a player that will appear in their notifications. Note your name will be added to the end of the message to them.',
  async run(args, senderSocket) {
    let str = '';
    for (let i = 2; i < args.length; i++) {
      str += args[i];
      str += ' ';
    }

    // @ts-ignore
    const senderUsername: string = senderSocket.request.user.username;

    str += `(From: ${senderUsername})`;

    User.findOne({ usernameLower: args[1].toLowerCase() }).exec(
      (err, foundUser) => {
        if (err) {
          console.log(err);
          senderSocket.emit('messageCommandReturnStr', {
            message: 'Server error... let me know if you see this.',
            classStr: 'server-text',
          });
        } else if (foundUser) {
          const userIdTarget = foundUser._id;
          const stringToSay = str;
          const link = '#';

          createNotification(userIdTarget, stringToSay, link, senderUsername);

          ModLog.create({
            type: 'mnotify',
            modWhoMade: {
              // @ts-ignore
              id: senderSocket.request.user.id,
              username: senderUsername,
              usernameLower: senderUsername.toLowerCase(),
            },
            data: {
              targetUser: {
                id: foundUser._id,
                username: foundUser.username,
                usernameLower: foundUser.usernameLower,
              },
              message: stringToSay,
            },
            dateCreated: new Date(),
          });

          senderSocket.emit('messageCommandReturnStr', {
            message: `Sent to ${foundUser.username} successfully! Here was your message: ${str}`,
            classStr: 'server-text',
          });
        } else {
          senderSocket.emit('messageCommandReturnStr', {
            message: `Could not find ${args[1]}`,
            classStr: 'server-text',
          });
        }
      },
    );
  },
};
