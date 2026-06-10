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

function parsePowerRole(value: string): PowerRole | undefined {
  const normalized = value.trim().toLowerCase();

  if (normalized in roleAliases) {
    return roleAliases[normalized];
  } else {
    return undefined;
  }
}

function refreshRoleStore(role: PowerRole) {
  switch (role) {
    case PowerRole.Moderator:
      ModStore.refreshRole();
      break;
    case PowerRole.Percival:
      PercivalStore.refreshRole();
      break;
    case PowerRole.TournamentOrganizer:
      TOStore.refreshRole();
      break;
    default: {
      const _exhaustive: never = role;
      throw new Error(`Unhandled PowerRole: ${_exhaustive}`);
    }
  }
}

function isRoleHeld(role: PowerRole, usernameLower: string): boolean {
  switch (role) {
    case PowerRole.Moderator:
      return ModStore.isRole(usernameLower);
    case PowerRole.Percival:
      return PercivalStore.isRole(usernameLower);
    case PowerRole.TournamentOrganizer:
      return TOStore.isRole(usernameLower);
    default: {
      const _exhaustive: never = role;
      throw new Error(`Unhandled PowerRole: ${_exhaustive}`);
    }
  }
}

function reply(socket: SocketUser, message: string) {
  socket.emit('messageCommandReturnStr', {
    message,
    classStr: 'server-text',
  });
}

function logAndDiscord(
  senderSocket: SocketUser,
  promoting: boolean,
  foundUsername: string,
  roleText: string,
) {
  const dateCreated = new Date();
  const senderUsername = senderSocket.request.user.username;
  const titleText = `Moderator ${senderUsername} has ${
    promoting ? 'ADDED' : 'REMOVED'
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
      body: `The ${promoting ? 'addition' : 'removal'} was made on: ${moment(
        dateCreated,
      ).format('LLL')}`,
    },
    dateCreated: dateCreated,
  });

  sendToDiscordMods(titleText, false);
  console.log(titleText);
}

async function handleList(
  role: PowerRole | undefined,
  winnerCase: boolean,
  roleText: string,
  senderSocket: SocketUser,
) {
  const foundList = winnerCase
    ? await User.find(
        { lastTourneyWinner: true },
        { usernameLower: 1, _id: 0 },
      )
    : await SiteRole.find({ role: role }, { usernameLower: 1, _id: 0 });

  if (foundList.length === 0) {
    reply(senderSocket, `Found no users in the ${roleText} role.`);
    return;
  }

  const roleUsernames = foundList.map((doc) => doc.usernameLower);
  reply(
    senderSocket,
    `Current members of the ${roleText} role:\n${roleUsernames.join(', ')}.`,
  );
}

async function promoteRole(
  role: PowerRole,
  usernames: string[],
  senderSocket: SocketUser,
) {
  let didPromote = false;

  for (const username of usernames) {
    const foundUser = await User.findOne({ usernameLower: username });

    if (!foundUser) {
      reply(senderSocket, `Could not find ${username}`);
      continue;
    }

    if (isRoleHeld(role, foundUser.usernameLower)) {
      reply(senderSocket, 'This user already has this role.');
      continue;
    }

    await SiteRole.create({
      role: role,
      usernameLower: foundUser.usernameLower,
    });

    didPromote = true;

    logAndDiscord(senderSocket, true, foundUser.username, role);
    reply(
      senderSocket,
      `Added ${foundUser.username} to ${role}.`,
    );
  }

  if (didPromote) {
    refreshRoleStore(role);
  }
}

async function promoteWinners(usernames: string[], senderSocket: SocketUser) {
  for (const username of usernames) {
    const foundUser = await User.findOne({ usernameLower: username });

    if (!foundUser) {
      reply(senderSocket, `Could not find ${username}`);
      continue;
    }

    if (foundUser.lastTourneyWinner) {
      reply(senderSocket, 'This user already has this role.');
      continue;
    }

    foundUser.lastTourneyWinner = true;
    await foundUser.save();

    logAndDiscord(senderSocket, true, foundUser.username, 'WINNER');
    reply(
      senderSocket,
      `Added ${foundUser.username} to WINNER.`,
    );
  }
}

async function demoteRole(
  role: PowerRole,
  usernames: string[],
  senderSocket: SocketUser,
) {
  let didDemote = false;

  for (const username of usernames) {
    const foundSiteRole = await SiteRole.findOne({
      usernameLower: username,
      role: role,
    });

    if (!foundSiteRole) {
      reply(senderSocket, `Could not find ${username} in list of ${role}s.`);
      continue;
    }

    const foundUser = await User.findOne({ usernameLower: username });
    const displayName = foundUser?.username ?? username;

    await foundSiteRole.deleteOne();
    didDemote = true;

    logAndDiscord(senderSocket, false, displayName, role);
    reply(senderSocket, `Removed ${displayName} from ${role}.`);
  }

  if (didDemote) {
    refreshRoleStore(role);
  }
}

async function demoteWinners(usernames: string[], senderSocket: SocketUser) {
  for (const username of usernames) {
    const foundUser = await User.findOne({ usernameLower: username });

    if (!foundUser) {
      reply(senderSocket, `Could not find ${username}`);
      continue;
    }

    if (!foundUser.lastTourneyWinner) {
      reply(senderSocket, `Could not find ${username} in list of WINNERs.`);
      continue;
    }

    foundUser.lastTourneyWinner = false;
    await foundUser.save();

    logAndDiscord(senderSocket, false, foundUser.username, 'WINNER');
    reply(
      senderSocket,
      `Removed ${foundUser.username} from WINNER.`,
    );
  }
}

export const msiterole: Command = {
  command: 'msiterole',
  help: '/msiterole <add|remove|list> <mod|to|percy|winner> [<username> <username>...]: Adds or removes players from a role or shows all members of a role.',
  async run(args, senderSocket) {
    // list needs <action> <role>; add/remove also need at least one username
    if (args.length < 3) {
      reply(senderSocket, 'Please specify an action, a role, and a username.');
      return;
    }

    const action = args[1].toLowerCase();
    if (!['add', 'remove', 'list'].includes(action)) {
      reply(
        senderSocket,
        'Invalid action. Specify one of: "add", "remove", or "list".',
      );
      return;
    }

    const role = parsePowerRole(args[2]);
    const winnerCase = args[2].toLowerCase() === 'winner';
    if (role === undefined && !winnerCase) {
      reply(
        senderSocket,
        'Invalid role name. Specify one of: "Moderator", "Tournament_Organizer", "Percival", or "Winner".',
      );
      return;
    }

    const roleText = winnerCase ? 'WINNER' : (role as PowerRole);

    if (action === 'list') {
      await handleList(role, winnerCase, roleText, senderSocket);
      return;
    }

    if (args.length < 4) {
      reply(senderSocket, 'Please specify at least one username.');
      return;
    }

    const senderUsername: string = senderSocket.request.user.username;
    if (role === PowerRole.Moderator && !isAdmin(senderUsername)) {
      reply(
        senderSocket,
        'Admin permissions are needed to modify the MODERATOR role.',
      );
      return;
    }

    const usernames = args.slice(3).map((e) => e.toLowerCase());

    if (action === 'add') {
      if (winnerCase) {
        await promoteWinners(usernames, senderSocket);
      } else {
        await promoteRole(role as PowerRole, usernames, senderSocket);
      }
    } else {
      if (winnerCase) {
        await demoteWinners(usernames, senderSocket);
      } else {
        await demoteRole(role as PowerRole, usernames, senderSocket);
      }
    }
  },
};
