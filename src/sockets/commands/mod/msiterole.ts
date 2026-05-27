import { Command } from '../types';
import User from '../../../models/user';
import SiteRole from '../../../models/siteRole';
import ModLog from '../../../models/modLog';
import { ModStore, PercivalStore, TOStore } from '../../../modsadmins/roles';
import { isAdmin } from '../../../modsadmins/admins';
import { sendToDiscordMods } from '../../../clients/discord';
import moment from 'moment';
import { PowerRole } from '../../../models/types/siteRole';
import type { SocketUser } from '../../../sockets/types';

const roleAliases: Record<string, PowerRole> = {
  mod: PowerRole.Moderator,
  moderator: PowerRole.Moderator,

  to: PowerRole.TournamentOrganizer,
  tournament_organizer: PowerRole.TournamentOrganizer,

  percival: PowerRole.Percival,
  percy: PowerRole.Percival,
};

function parsePowerRole(value: string): PowerRole {
  const normalized = value.trim().toLowerCase();

  if (normalized in roleAliases) {
    return roleAliases[normalized];
  } else {
    return null;
  }
}

function refreshRoleStore(role: PowerRole) {
  if (role === PowerRole.Moderator) {
    ModStore.refreshRole();
  } else if (role === PowerRole.Percival) {
    PercivalStore.refreshRole();
  } else if (role === PowerRole.TournamentOrganizer) {
    TOStore.refreshRole();
  }
}

function logAndDiscord(
  senderSocket: SocketUser,
  promoting: Boolean,
  foundUsername: String,
  roleText: String,
) {
  const dateCreated = new Date();
  const senderUsername = senderSocket.request.user.username;
  const titleText = `Moderator ${senderUsername} has ${
    promoting ? 'PROMOTED' : 'DEMOTED'
  } ${foundUsername} ${promoting ? 'to' : 'from'} ${roleText}.`;

  ModLog.create({
    type: 'text',
    modWhoMade: {
      // @ts-ignore
      id: senderSocket.request.user.id,
      username: senderUsername,
      usernameLower: senderUsername.toLowerCase(),
    },
    data: {
      title: titleText,
      body: `The ${promoting ? 'promotion' : 'demotion'} was made on: ${moment(
        dateCreated,
      ).format('LLL')}`,
    },
    dateCreated: dateCreated,
  });

  sendToDiscordMods(titleText, false);
  console.log(titleText);
}

export const msiterole: Command = {
  command: 'msiterole',
  help: '/msiterole <action> <role> [<username> <username>...]: Promotes or demotes players from a role or shows all members of a role.',
  async run(args, senderSocket) {
    if (args.length < 3 || (args[1] !== 'list' && args.length < 4)) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Please specify an action, a role, and a username.',
        classStr: 'server-text',
      });
      return;
    }

    const action = args[1].toLowerCase();
    const role = parsePowerRole(args[2]);
    const winnerCase = args[2].toLowerCase() === 'winner';

    if (role == null && !winnerCase) {
      senderSocket.emit('messageCommandReturnStr', {
        message:
          'Invalid role name. Specify one of: "Moderator", "Tournament_Organizer", "Percival", or "Winner".',
        classStr: 'server-text',
      });
      return;
    }

    if (!['promote', 'demote', 'list'].includes(action)) {
      senderSocket.emit('messageCommandReturnStr', {
        message:
          'Invalid action. Specify one of: "promote", "demote", or "list".',
        classStr: 'server-text',
      });
      return;
    }

    const roleText = winnerCase ? 'WINNER' : role;

    if (action === 'list') {
      //Case for listing all members of a role
      let foundList;

      if (winnerCase) {
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
          message: `Current members of the ${roleText} role:\n${roleUsernames.join(
            ', ',
          )}.`,
          classStr: 'server-text',
        });
      } else {
        senderSocket.emit('messageCommandReturnStr', {
          message: `Found no users in the ${roleText} role.`,
          classStr: 'server-text',
        });
      }
      return;
    }

    const usernames = args.slice(3).map((e) => e.toLowerCase());
    const senderUsername: string = senderSocket.request.user.username;
    const senderIsAdmin = isAdmin(senderUsername);

    if (
      [PowerRole.Moderator, PowerRole.Percival].includes(role) &&
      !senderIsAdmin
    ) {
      senderSocket.emit('messageCommandReturnStr', {
        message:
          'Admin permissions are needed to assign MODERATOR or PERCIVAL roles.',
        classStr: 'server-text',
      });
      return;
    }

    if (action === 'promote') {
      //Case for promotion
      const TOCount = await SiteRole.countDocuments({
        role: PowerRole.TournamentOrganizer,
      });
      if (
        role === PowerRole.TournamentOrganizer &&
        usernames.length + TOCount > 10
      ) {
        senderSocket.emit('messageCommandReturnStr', {
          message:
            'This would result in more than 10 TOURNAMENT ORGANIZERS; please demote some before promoting this many.',
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
            (role === PowerRole.Moderator && ModStore.isRole(username)) ||
            (role === PowerRole.Percival && PercivalStore.isRole(username)) ||
            (role === PowerRole.TournamentOrganizer &&
              TOStore.isRole(username)) ||
            (winnerCase && foundUser.lastTourneyWinner)
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

          if (winnerCase) {
            foundUser.lastTourneyWinner = true;
            await foundUser.save();
          } else {
            await SiteRole.create(promoteData);
          }

          refreshRoleStore(role);
          logAndDiscord(senderSocket, true, foundUser.username, roleText);

          senderSocket.emit('messageCommandReturnStr', {
            message: `Promoted ${foundUser.username} to ${roleText} successfully!`,
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
        if (winnerCase) {
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
          (winnerCase && foundUser && foundUser.lastTourneyWinner) ||
          (!winnerCase && foundSiteRole)
        ) {
          if (winnerCase) {
            foundUser.lastTourneyWinner = false;
            await foundUser.save();
          } else {
            await foundSiteRole.deleteOne();
          }

          refreshRoleStore(role);
          logAndDiscord(senderSocket, false, username, roleText);

          senderSocket.emit('messageCommandReturnStr', {
            message: `Demoted ${username} from ${roleText} successfully!`,
            classStr: 'server-text',
          });
        } else {
          senderSocket.emit('messageCommandReturnStr', {
            message: `Could not find ${username} in list of ${roleText}s.`,
            classStr: 'server-text',
          });
        }
      }
    }
  },
};
