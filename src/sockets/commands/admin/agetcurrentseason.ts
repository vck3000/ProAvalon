// TODO-kev: Delete this file. Purely for testing purposes

import { Command } from '../types';
import { SocketUser } from '../../types';
import dbAdapter from '../../../databaseAdapters';
import { sendReplyToCommand } from '../../sockets';
import { ISeason } from '../../../models/types/season';
import { stringifySeason } from '../../../databaseAdapters/mongoose/season';

export const agetcurrentseason: Command = {
  command: 'agcs',
  help: '/agcs: Gets current season details.',
  run: async (args: string[], socket: SocketUser) => {
    const currentSeason: ISeason = await dbAdapter.season.getCurrentSeason();
    if (!currentSeason) {
      sendReplyToCommand(socket, 'There is no active season right now.');
      return;
    }

    const message = `Current Season details: ${stringifySeason(currentSeason)}`;

    sendReplyToCommand(socket, message);
  },
};
