import { Command } from '../types';
import { SocketUser } from '../../types';
import dbAdapter from '../../../databaseAdapters';
import { sendReplyToCommand } from '../../sockets';
import { ISeason } from '../../../models/types/season';
import { stringifySeason } from '../../../databaseAdapters/mongoose/season';
import { RATING_BRACKETS } from '../../../gameplay/elo/ratingBrackets';

// Debug command only available in local
export const acreateseason: Command = {
  command: 'acs',
  help: '/acs <name>: Creates a new season',
  run: async (args: string[], socket: SocketUser) => {
    if (args.length != 2) {
      sendReplyToCommand(socket, 'Please include the season name.');
      return;
    }

    const seasonName = args[1];
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 3); // 3 months

    try {
      const newSeason = await dbAdapter.season.createSeason(
        seasonName,
        startDate,
        endDate,
        RATING_BRACKETS,
      );
      const message = `Created new season: ${stringifySeason(newSeason)}`;

      sendReplyToCommand(socket, message);
    } catch (error) {
      sendReplyToCommand(socket, error.message);
      return;
    }
  },
};
