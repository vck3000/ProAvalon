import { Command } from '../types';
import User from '../../../models/user';
import SiteRole from '../../../models/siteRole';
import ModLog from '../../../models/modLog';
import { ModStore, PercivalStore, TOStore } from '../../../modsadmins/roles';
import { isAdmin } from '../../../modsadmins/admins';
import { sendToDiscordMods } from '../../../clients/discord';
import moment from 'moment';

export const msiterole: Command = {
  command: 'msiterole',
  help: '/msiterole <action> <role> [<username> <username>...]: Promotes or demotes players from a role or shows all members of a role.',
  async run(args, senderSocket) {
    if (args.length < 3 || (args[1] !== 'allrole' && args.length < 4)) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Please specify an action, a role, and a username.',
        classStr: 'server-text',
      });
      return;
    }

    const action = args[1].toLowerCase();
    const role = args[2].toLowerCase();

    if (!['moderator', 'to', 'percival', 'winner'].includes(role)) {
      senderSocket.emit('messageCommandReturnStr', {
        message:
          'Invalid role name. Specify one of: "moderator", "to", "percival", or "winner".',
        classStr: 'server-text',
      });
      return;
    }

    if (action === 'allrole') {
      //Case for listing all members of a role
      let foundList;

      if (role === 'winner') {
        foundList = await User.find(
          { lastTourneyWinner: true },
          { usernameLower: 1, _id: 0 },
        );
      } else {
        foundList = await SiteRole.find(
          { role: role },
          { usernameLower: 1, _id: 0 },
        );
      }

      if (foundList.length > 0) {
        const roleUsernames = foundList.map((doc) => doc.usernameLower);
        senderSocket.emit('messageCommandReturnStr', {
          message: `Current members of the ${role.toUpperCase()} role:\n${roleUsernames.join(
            ', ',
          )}.`,
          classStr: 'server-text',
        });
      } else {
        senderSocket.emit('messageCommandReturnStr', {
          message: `Found no users in the ${role.toUpperCase()} role.`,
          classStr: 'server-text',
        });
      }
      return;
    } else if (!['promote', 'demote'].includes(action)) {
      senderSocket.emit('messageCommandReturnStr', {
        message:
          'Invalid action. Specify one of: "promote", "demote", or "allrole".',
        classStr: 'server-text',
      });
      return;
    }

    const usernames = args.slice(3).map((e) => e.toLowerCase());
    const senderUsername: string = senderSocket.request.user.username;
    const senderIsAdmin = isAdmin(senderUsername);

    if (['moderator', 'percival'].includes(role) && !senderIsAdmin) {
      senderSocket.emit('messageCommandReturnStr', {
        message:
          'Admin permissions are needed to assign moderator or percival roles.',
        classStr: 'server-text',
      });
      return;
    }

    if (action === 'promote') {
      //Case for promotion
      const TOCount = await SiteRole.countDocuments({ role: 'to' });
      if (role === 'to' && usernames.length + TOCount > 10) {
        senderSocket.emit('messageCommandReturnStr', {
          message:
            'This would result in more than 10 Tournament Organizers; please demote some before promoting this many.',
          classStr: 'server-text',
        });
        return;
      }
      for (const username of usernames) {
        const foundUser = await User.findOne({
          usernameLower: username,
        });

        if (foundUser) {
          if (
            (role === 'moderator' && ModStore.isRole(username)) ||
            (role === 'percival' && PercivalStore.isRole(username)) ||
            (role === 'to' && TOStore.isRole(username)) ||
            (role === 'winner' && foundUser.lastTourneyWinner)
          ) {
            senderSocket.emit('messageCommandReturnStr', {
              message: 'This user already has this role.',
              classStr: 'server-text',
            });
            continue;
          }

          const promoteData = {
            role: role,
            usernameLower: foundUser.usernameLower,
          };

          if (role === 'winner') {
            foundUser.lastTourneyWinner = true;
            await foundUser.save();
          } else {
            await SiteRole.create(promoteData);
          }

          if (role === 'moderator') {
            ModStore.refreshRole();
          } else if (role === 'percival') {
            PercivalStore.refreshRole();
          } else if (role === 'to') {
            TOStore.refreshRole();
          }

          const promotionText = `Moderator ${senderUsername} has PROMOTED ${
              foundUser.username
            } to ${role.toUpperCase()}.`
          const dateCreated = new Date();

          ModLog.create({
            type: 'text',
            modWhoMade: {
              // @ts-ignore
              id: senderSocket.request.user.id,
              username: senderUsername,
              usernameLower: senderUsername.toLowerCase(),
            },
            data: {
              title: promotionText,
              body: `The promotion was made on: ${moment(dateCreated).format('LLL')}`,
            },
            dateCreated: dateCreated,
          });

          sendToDiscordMods(
            promotionText,
            false,
          );
          console.log(promotionText)

          senderSocket.emit('messageCommandReturnStr', {
            message: `Promoted ${
              foundUser.username
            } to ${role.toUpperCase()} successfully!`,
            classStr: 'server-text',
          });
        } else {
          senderSocket.emit('messageCommandReturnStr', {
            message: `Could not find ${username}`,
            classStr: 'server-text',
          });
        }
      }
    } else if (action === 'demote') {
      //Case for demotion
      for (const username of usernames) {
        let foundUser;
        let foundSiteRole;
        if (role === 'winner') {
          foundUser = await User.findOne({
            usernameLower: username,
          });
        } else {
          foundSiteRole = await SiteRole.findOne({
            usernameLower: username,
            role: role,
          });
        }

        if (
          (role === 'winner' && foundUser && foundUser.lastTourneyWinner) ||
          (role !== 'winner' && foundSiteRole)
        ) {
          const demoteData = {
            role: role,
            usernameLower:
              role === 'winner'
                ? foundUser.usernameLower
                : foundSiteRole.usernameLower,
          };

          if (role === 'winner') {
            foundUser.lastTourneyWinner = false;
            await foundUser.save();
          } else {
            await foundSiteRole.deleteOne();
          }

          if (role === 'moderator') {
            ModStore.refreshRole();
          } else if (role === 'percival') {
            PercivalStore.refreshRole();
          } else if (role === 'to') {
            TOStore.refreshRole();
          }

          const demotionText = `Moderator ${senderUsername} has DEMOTED ${username} from ${role.toUpperCase()}.`;
          const dateCreated = new Date();

          ModLog.create({
            type: 'text',
            modWhoMade: {
              // @ts-ignore
              id: senderSocket.request.user.id,
              username: senderUsername,
              usernameLower: senderUsername.toLowerCase(),
            },
            data: {
              title: demotionText,
              body: `The demotion was made on: ${moment(dateCreated).format('LLL')}`,
            },
            dateCreated: dateCreated,
          });

          sendToDiscordMods(
            demotionText,
            false,
          );
          console.log(demotionText);

          senderSocket.emit('messageCommandReturnStr', {
            message: `Demoted ${username} from ${role.toUpperCase()} successfully!`,
            classStr: 'server-text',
          });
        } else {
          senderSocket.emit('messageCommandReturnStr', {
            message: `Could not find ${username} in list of ${role.toUpperCase()}s.`,
            classStr: 'server-text',
          });
        }
      }
    }
  },
};
