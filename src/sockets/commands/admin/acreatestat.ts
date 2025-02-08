// TODO-kev: Delete this file. Purely for testing purposes

import { Command } from '../types';
import { SocketUser } from '../../types';
import { sendReplyToCommand } from '../../sockets';
import { IUser } from '../../../gameplay/gameEngine/types';
import { IUserSeasonStat } from '../../../models/types/userSeasonStat';
import { ISeason } from '../../../models/types/season';
import { Role } from '../../../gameplay/gameEngine/roles/types';
import dbAdapter from '../../../databaseAdapters';
import { stringifyUserSeasonStat } from '../../../databaseAdapters/mongoose/userSeasonStat';

export const agetstat: Command = {
  command: 'ags',
  help: '/ags: Get stat',
  run: async (args: string[], socket: SocketUser) => {
    const season: ISeason = await dbAdapter.season.getCurrentSeason();
    const user: IUser = socket.request.user;

    const stat: IUserSeasonStat =
      await dbAdapter.userSeasonStat.findOrCreateStat(user.id, season.id);

    const message = `
      Current stat for ${user.username}: ${stringifyUserSeasonStat(stat)}`;

    sendReplyToCommand(socket, message);
  },
};

// TODO-kev: This command is just for testing. Delete
export const aupdatestat: Command = {
  command: 'aus',
  help: '/aus <role> <result>: Update a stat. Argument takes in a role and then "win" or "lose"',
  run: async (args: string[], socket: SocketUser) => {
    if (args.length !== 3 || (args[2] !== 'win' && args[2] !== 'lose')) {
      sendReplyToCommand(socket, 'State "win" or "lose"');
      return;
    }

    const season: ISeason = await dbAdapter.season.getCurrentSeason();
    const user: IUser = socket.request.user;
    const userSeasonStat: IUserSeasonStat =
      await dbAdapter.userSeasonStat.findOrCreateStat(user.id, season.id);
    const roleString = args[1];
    const result = args[2];
    let role: Role;

    if (Object.values(Role).includes(roleString as Role)) {
      role = roleString as Role;
    } else {
      sendReplyToCommand(socket, 'Invalid role received"');
      return;
    }

    let stat: IUserSeasonStat;

    if (result === 'win') {
      stat = await dbAdapter.userSeasonStat.registerGameOutcome(
        userSeasonStat,
        true,
        25,
        role,
      );
    } else {
      stat = await dbAdapter.userSeasonStat.registerGameOutcome(
        userSeasonStat,
        false,
        -10,
        role,
      );
    }

    const message = `
      New stat for ${user.username}: ${stringifyUserSeasonStat(stat)}`;

    sendReplyToCommand(socket, message);
  },
};
