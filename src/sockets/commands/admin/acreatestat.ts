// TODO-kev: Delete this file. Purely for testing purposes

import { Command } from '../types';
import { SocketUser } from '../../types';
import { sendReplyToCommand } from '../../sockets';
import { IUser } from '../../../gameplay/types';
import { IUserSeasonStat } from '../../../models/types/userSeasonStat';
import mongoDbAdapter from '../../../databaseAdapters/mongoose';
import { ISeason } from '../../../models/types/season';

export const agetstat: Command = {
  command: 'ags',
  help: '/ags: Get stat',
  run: async (args: string[], socket: SocketUser) => {
    const season: ISeason = await mongoDbAdapter.season.getCurrentSeason();
    const user: IUser = socket.request.user;

    const stat: IUserSeasonStat = await mongoDbAdapter.userSeasonStat.getStat(
      user.id,
      season.id,
    );

    const message = `
      Current stat for ${
        user.username
      }: ${mongoDbAdapter.userSeasonStat.formatUserSeasonStat(stat)}`;

    sendReplyToCommand(socket, message);
  },
};

export const aupdatestat: Command = {
  command: 'aus',
  help: '/aus: Update a stat. Argument takes in "win" or "lose"',
  run: async (args: string[], socket: SocketUser) => {
    if (args.length !== 2 || (args[1] !== 'win' && args[1] !== 'lose')) {
      sendReplyToCommand(socket, 'State "win" or "lose"');
    }

    const season: ISeason = await mongoDbAdapter.season.getCurrentSeason();
    const user: IUser = socket.request.user;

    let stat: IUserSeasonStat;

    if (args[1] === 'win') {
      stat = await mongoDbAdapter.userSeasonStat.updateStat(
        user.id,
        season.id,
        true,
        25,
      );
    } else {
      stat = await mongoDbAdapter.userSeasonStat.updateStat(
        user.id,
        season.id,
        false,
        -10,
      );
    }

    const message = `
      New stat for ${
        user.username
      }: ${mongoDbAdapter.userSeasonStat.formatUserSeasonStat(stat)}`;

    sendReplyToCommand(socket, message);
  },
};
