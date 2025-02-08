// Delete the below following season update. Purely for testing purposes

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

export const aupdatestat: Command = {
  command: 'aus',
  help: '/aus <numPlayers> <role> <result>: Update a stat. Argument takes in a role and then "win" or "lose"',
  run: async (args: string[], socket: SocketUser) => {
    if (args.length !== 4) {
      sendReplyToCommand(
        socket,
        'Insufficient arguments: <numPlayers> <role> <result>',
      );
      return;
    }

    const numPlayers = Number(args[1]);
    const role = args[2] as Role;
    const result = args[3];

    if (isNaN(numPlayers)) {
      sendReplyToCommand(socket, 'Number of players must be a number');
      return;
    }

    if (result !== 'win' && result !== 'lose') {
      sendReplyToCommand(socket, 'State "win" or "lose"');
      return;
    }

    const season: ISeason = await dbAdapter.season.getCurrentSeason();
    const user: IUser = socket.request.user;
    const userSeasonStat: IUserSeasonStat =
      await dbAdapter.userSeasonStat.findOrCreateStat(user.id, season.id);

    if (!Object.values(Role).includes(role as Role)) {
      sendReplyToCommand(socket, 'Invalid role received"');
      return;
    }

    let stat: IUserSeasonStat;

    if (result === 'win') {
      stat = await dbAdapter.userSeasonStat.registerGameOutcome(
        userSeasonStat,
        true,
        25,
        numPlayers,
        role,
      );
    } else {
      stat = await dbAdapter.userSeasonStat.registerGameOutcome(
        userSeasonStat,
        false,
        -10,
        numPlayers,
        role,
      );
    }

    const message = `
      New stat for ${user.username}: ${stringifyUserSeasonStat(stat)}`;

    sendReplyToCommand(socket, message);
  },
};
