import { Command } from '../types';
import ModOrg from '../../../models/modOrg';
import ModLog from '../../../models/modLog';
import { refreshTOs } from '../../../modsadmins/tournamentOrganizers';
import { sendToDiscordMods } from '../../../clients/discord';

export const mdemote: Command = {
  command: 'mdemote',
  help: '/mdemote <username>: Demotes a player from the Tournament Organizer role.',
  async run(args, senderSocket) {
    if (!args[1]) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Specify a username.',
        classStr: 'server-text',
      });
      return;
    }

    const senderUsername: string = senderSocket.request.user.username;

    ModOrg.findOne({ usernameLower: args[1].toLowerCase(), role: 'to' }).exec(
      (err, foundModOrg) => {
        if (err) {
          console.log(err);
          senderSocket.emit('messageCommandReturnStr', {
            message: 'Server error... let me know if you see this.',
            classStr: 'server-text',
          });
        } else if (foundModOrg) {
          const demoteData = {
            role: 'to',
            username: foundModOrg.username,
            usernameLower: foundModOrg.usernameLower,
            promotionDate: foundModOrg.promotionDate,
          };

          foundModOrg.deleteOne((err) => {
            if (err) {
              console.log(err);
              senderSocket.emit('messageCommandReturnStr', {
                message: 'Server error... let me know if you see this.',
                classStr: 'server-text',
              });
            } else {
              ModLog.create({
                type: 'demote',
                modWhoMade: {
                  // @ts-ignore
                  id: senderSocket.request.user.id,
                  username: senderUsername,
                  usernameLower: senderUsername.toLowerCase(),
                },
                data: demoteData,
                dateCreated: new Date(),
              });

              refreshTOs();

              sendToDiscordMods(
                `Moderator ${senderUsername} has DEMOTED ${foundModOrg.username} from TO.`,
                false,
              );

              senderSocket.emit('messageCommandReturnStr', {
                message: `Demoted ${foundModOrg.username} from TO successfully!`,
                classStr: 'server-text',
              });
            }
          });
        } else {
          senderSocket.emit('messageCommandReturnStr', {
            message: `Could not find ${args[1]} in list of TOs.`,
            classStr: 'server-text',
          });
        }
      },
    );
  },
};
