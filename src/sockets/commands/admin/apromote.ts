import { Command } from '../types';
import User from '../../../models/user';
import ModOrg from '../../../models/modOrg';
import ModLog from '../../../models/modLog';
import { isMod, refreshMods } from '../../../modsadmins/mods';
import { isPercival, refreshPercivals } from '../../../modsadmins/percivals';
import { isTO, refreshTOs } from '../../../modsadmins/tournamentOrganizers';
import { isWinner, refreshWinners } from '../../../rewards/getRewards';
import { sendToDiscordMods } from '../../../clients/discord';

export const apromote: Command = {
  command: 'apromote',
  help: '/apromote <username> <role>: Promotes a player to a power role.',
  async run(args, senderSocket) {
    if (!args[1]) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Specify a username.',
        classStr: 'server-text',
      });
      return;
    } else if (
      !args[2] ||
      !['moderator', 'to', 'percival', 'winner'].includes(args[2].toLowerCase())
    ) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Specify a role: either Moderator, TO, Percival, or Winner.',
        classStr: 'server-text',
      });
      return;
    }

    const targetRole = args[2].toLowerCase();

    if (
      (targetRole === 'moderator' && isMod(args[1].toLowerCase())) ||
      (targetRole === 'percival' && isPercival(args[1].toLowerCase())) ||
      (targetRole === 'to' && isTO(args[1].toLowerCase())) ||
      (targetRole === 'winner' && isWinner(args[1].toLowerCase()))
    ) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'This user already has this role.',
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
            role: targetRole,
            username: foundUser.username,
            usernameLower: foundUser.usernameLower,
            promotionDate: new Date(),
          };

          ModOrg.create(promoteData).then((results) => {
            if (targetRole === 'moderator') {
              refreshMods();
            } else if (targetRole === 'percival') {
              refreshPercivals();
            } else if (targetRole === 'to') {
              refreshTOs();
            } else if (targetRole === 'winner') {
              refreshWinners();
            }
          });

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

          sendToDiscordMods(
            `Admin ${senderUsername} has PROMOTED ${
              foundUser.username
            } to ${targetRole.toUpperCase()}.`,
            false,
          );

          senderSocket.emit('messageCommandReturnStr', {
            message: `Promoted ${
              foundUser.username
            } to ${targetRole.toUpperCase()} successfully!`,
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
