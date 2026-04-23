import { Command } from '../types';
import ModOrg from '../../../models/modOrg';
import ModLog from '../../../models/modLog';
import { refreshMods } from '../../../modsadmins/mods';
import { refreshPercivals } from '../../../modsadmins/percivals';
import { refreshTOs } from '../../../modsadmins/tournamentOrganizers';

export const ademote: Command = {
  command: 'ademote',
  help: '/ademote <username> <role>: Demotes a player from a power role.',
  async run(args, senderSocket) {
    if (!args[1]) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Specify a username.',
        classStr: 'server-text',
      });
      return;
    } else if (
      !args[2] ||
      !['moderator', 'to', 'percival'].includes(args[2].toLowerCase())
    ) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Specify a role: either Moderator, TO, or Percival.',
        classStr: 'server-text',
      });
      return;
    }

    const targetRole = args[2].toLowerCase();
    const senderUsername: string = senderSocket.request.user.username;

    ModOrg.findOne({
      usernameLower: args[1].toLowerCase(),
      role: targetRole,
    }).exec((err, foundModOrg) => {
      if (err) {
        console.log(err);
        senderSocket.emit('messageCommandReturnStr', {
          message: 'Server error... let me know if you see this.',
          classStr: 'server-text',
        });
      } else if (foundModOrg) {
        const demoteData = {
          role: targetRole,
          username: foundModOrg.username,
          usernameLower: foundModOrg.usernameLower,
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

            if (targetRole === 'moderator') {
              refreshMods();
            } else if (targetRole === 'percival') {
              refreshPercivals();
            } else if (targetRole === 'to') {
              refreshTOs();
            }

            senderSocket.emit('messageCommandReturnStr', {
              message: `Demoted ${
                foundModOrg.username
              } from ${targetRole.toUpperCase()} successfully!`,
              classStr: 'server-text',
            });
          }
        });
      } else {
        senderSocket.emit('messageCommandReturnStr', {
          message: `Could not find ${
            args[1]
          } in list of ${targetRole.toUpperCase()}s.`,
          classStr: 'server-text',
        });
      }
    });
  },
};
