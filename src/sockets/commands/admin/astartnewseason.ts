// TODO-kev: Delete this file. Purely for testing purposes

import { Command } from '../types';
import { SocketUser } from '../../types';
import seasonAdapter from '../../../databaseAdapters/season';
import { sendReplyToCommand } from '../../sockets';

export const astartnewseason: Command = {
  command: 'anewseason',
  help: '/anewseason: Creates a new season',
  run: async (args: string[], socket: SocketUser) => {
    await seasonAdapter.createSeason();

    sendReplyToCommand(socket, 'Created season.');
  },
};
