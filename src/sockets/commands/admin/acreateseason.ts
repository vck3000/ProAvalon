// TODO-kev: Delete this file. Purely for testing purposes

import { Command } from '../types';
import { SocketUser } from '../../types';
import { seasonAdapter } from '../../../databaseAdapters/mongoose';
import { sendReplyToCommand } from '../../sockets';
import { ISeason } from '../../../models/types/season.types';

export const acreateseason: Command = {
  command: 'acs',
  help: '/acs <name>: Creates a new season',
  run: async (args: string[], socket: SocketUser) => {
    if (args.length != 2) {
      sendReplyToCommand(socket, 'Please include the season name.');
      return;
    }

    const seasonName = args[1];

    try {
      const newSeason: ISeason = await seasonAdapter.createSeason(seasonName);
      const message = `Created new season: ${seasonAdapter.parseSeason(
        newSeason,
      )}`;

      sendReplyToCommand(socket, message);
    } catch (error) {
      sendReplyToCommand(socket, error.message);
      return;
    }
  },
};
