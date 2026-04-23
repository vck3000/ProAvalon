import { Command } from '../types';
import User from '../../../models/user';
import ModOrg from '../../../models/modOrg';
import ModLog from '../../../models/modLog';
import { isTO, refreshTOs } from '../../../modsadmins/tournamentOrganizers';

export const mpromote: Command = {
  command: 'mpromote',
  help: '/mpromote <username>: Promotes a player to the Tournament Organizer role.',
  async run(args, senderSocket) {
    if (!args[1]) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Specify a role: either Moderator, TO, or Percival.',
        classStr: 'server-text',
      });
      return;
    } else if (isTO(args[1].toLowerCase())) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'This user is already a TO.',
        classStr: 'server-text',
      });
      return;
    }

    const senderUsername: string = senderSocket.request.user.username;

    User.findOne({ usernameLower: args[1].toLowerCase() }).exec(
      (err, foundUser) => {
        if (err) {
          console.log(err);
          senderSocket.emit('messageCommandReturnStr', {
            message: 'Server error... let me know if you see this.',
            classStr: 'server-text',
          });
        } else if (foundUser) {
          const promoteData = {
            role: 'to',
            username: foundUser.username,
            usernameLower: foundUser.usernameLower,
            promotionDate: new Date(),
          };

          ModOrg.create(promoteData).then(
            result => {
              refreshTOs();
            }
          );

          ModLog.create({
            type: 'promote',
            modWhoMade: {
              // @ts-ignore
              id: senderSocket.request.user.id,
              username: senderUsername,
              usernameLower: senderUsername.toLowerCase(),
            },
            data: promoteData,
            dateCreated: new Date(),
          });

          

          senderSocket.emit('messageCommandReturnStr', {
            message: `Promoted ${foundUser.username} to TO successfully!`,
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
