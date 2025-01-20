// TODO-kev: Delete this file. Purely for testing purposes

import { Command } from '../types';
import { SocketUser } from '../../types';
import seasonAdapter from '../../../databaseAdapters/season';
import { sendReplyToCommand } from '../../sockets';
import { ISeason } from '../../../models/types/season.types';
import { IUser } from '../../../gameplay/types';
import seasonalStatAdapter from '../../../databaseAdapters/seasonalStat';
import { ISeasonalStat } from '../../../models/types/seasonalStats.types';

export const acreatestat: Command = {
  command: 'acstat',
  help: '/acstat: Creates a new stat',
  run: async (args: string[], socket: SocketUser) => {
    const season: ISeason = await seasonAdapter.getCurrentSeason();
    const user: IUser = socket.request.user;

    await seasonalStatAdapter.createStat(user._id, season._id);

    sendReplyToCommand(socket, `Created stat for ${user.username}`);
  },
};

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
      Current stat for ${user.username}: rating=${stat.rating}, 
      highestRating=${stat.highestRating}, 
      ratingBracket=${stat.ratingBracket},
      rankedGamesPlayed=${stat.rankedGamesPlayed}, 
      rankedGamesWon=${stat.rankedGamesWon}, 
      rankedGamesLost=${stat.rankedGamesLost}, 
      winRate=${stat.winRate}, 
      lastUpdated=${stat.lastUpdated}, 
    `;

    sendReplyToCommand(socket, message);
  },
};
