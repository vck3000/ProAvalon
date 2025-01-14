// TODO-kev: Delete this file. Purely for testing purposes

import { Command } from '../types';
import { SocketUser } from '../../types';
import seasonAdapter from '../../../databaseAdapters/season';
import { sendReplyToCommand } from '../../sockets';
import { ISeason } from '../../../models/types/season.types';

export const acreateseason: Command = {
  command: 'acs',
  help: '/acs: Creates a new season',
  run: async (args: string[], socket: SocketUser) => {
    if (args.length != 2) {
      sendReplyToCommand(socket, 'Please include the season name.');
      return;
    }

    const seasonName = args[1];

    try {
      const newSeason: ISeason = await seasonAdapter.createSeason(seasonName);
      const message = `Created new season:
      seasonId = ${newSeason._id};\n
      name = ${newSeason.name};\n
      startDate = ${newSeason.startDate};\n
      endDate = ${newSeason.endDate}
      `;

      sendReplyToCommand(socket, message);
    } catch (error) {
      sendReplyToCommand(socket, error.message);
      return;
    }
  },
};
