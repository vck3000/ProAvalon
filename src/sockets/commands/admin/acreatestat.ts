// TODO-kev: Delete this file. Purely for testing purposes

import { Command } from '../types';
import { SocketUser } from '../../types';
import seasonAdapter from '../../../databaseAdapters/season';
import { sendReplyToCommand } from '../../sockets';
import { ISeason } from '../../../models/types/season.types';
import { IUser } from '../../../gameplay/types';
import seasonalStatAdapter from '../../../databaseAdapters/seasonalStat';
import { ISeasonalStat } from '../../../models/types/seasonalStats.types';

export const agetstat: Command = {
  command: 'ags',
  help: '/ags: Get stat',
  run: async (args: string[], socket: SocketUser) => {
    const season: ISeason = await seasonAdapter.getCurrentSeason();
    const user: IUser = socket.request.user;

    const stat: ISeasonalStat = await seasonalStatAdapter.getStat(
      user._id,
      season._id,
    );

    const message = `
      Current stat for ${
        user.username
      }: ${seasonalStatAdapter.parseSeasonalStat(stat)}`;

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

    const season: ISeason = await seasonAdapter.getCurrentSeason();
    const user: IUser = socket.request.user;

    let stat: ISeasonalStat;

    if (args[1] === 'win') {
      stat = await seasonalStatAdapter.updateStat(
        user._id,
        season._id,
        true,
        25,
      );
    } else {
      stat = await seasonalStatAdapter.updateStat(
        user._id,
        season._id,
        false,
        -10,
      );
    }

    const message = `
      New stat for ${user.username}: ${seasonalStatAdapter.parseSeasonalStat(
      stat,
    )}`;

    sendReplyToCommand(socket, message);
  },
};
