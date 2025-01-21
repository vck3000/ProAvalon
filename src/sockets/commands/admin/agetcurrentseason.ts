// TODO-kev: Delete this file. Purely for testing purposes

import { Command } from '../types';
import { SocketUser } from '../../types';
import seasonAdapter from '../../../databaseAdapters/season';
import { sendReplyToCommand } from '../../sockets';
import { ISeason } from '../../../models/types/season.types';

export const agetcurrentseason: Command = {
  command: 'agcs',
  help: '/agcs: Gets current season',
  run: async (args: string[], socket: SocketUser) => {
    const currentSeason: ISeason = await seasonAdapter.getCurrentSeason();
    if (!currentSeason) {
      sendReplyToCommand(socket, 'No current season found!!!');
      return;
    }

    const message = `Current Season details:
      seasonId = ${currentSeason.id};
      name = ${currentSeason.name};
      startDate = ${currentSeason.startDate};
      endDate = ${currentSeason.endDate}
      `;

    sendReplyToCommand(socket, message);
  },
};
