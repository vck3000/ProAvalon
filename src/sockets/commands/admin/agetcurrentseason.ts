// TODO-kev: Delete this file. Purely for testing purposes

import { Command } from '../types';
import { SocketUser } from '../../types';
import mongoDbAdapter from '../../../databaseAdapters/mongoose';
import { sendReplyToCommand } from '../../sockets';
import { ISeason } from '../../../models/types/season';

export const agetcurrentseason: Command = {
  command: 'agcs',
  help: '/agcs: Gets current season details.',
  run: async (args: string[], socket: SocketUser) => {
    const currentSeason: ISeason =
      await mongoDbAdapter.season.getCurrentSeason();
    if (!currentSeason) {
      sendReplyToCommand(socket, 'There is no active season right now.');
      return;
    }

    const message = `Current Season details: ${mongoDbAdapter.season.formatSeason(
      currentSeason,
    )}`;

    sendReplyToCommand(socket, message);
  },
};
