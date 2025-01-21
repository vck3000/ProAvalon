// TODO-kev: Delete this file. Purely for testing purposes

import { Command } from '../types';
import { SocketUser } from '../../types';
import { seasonAdapter } from '../../../databaseAdapters/mongoose';
import { sendReplyToCommand } from '../../sockets';

export const aresetseason: Command = {
  command: 'ars',
  help: '/ars: Reset season.',
  run: async (args: string[], socket: SocketUser) => {
    if (args.length != 2) {
      sendReplyToCommand(socket, 'Please include the season name.');
      return;
    }

    const seasonName = args[1];

    try {
      await seasonAdapter.resetSeason(seasonName);
      sendReplyToCommand(socket, 'Successfully reset season.');
    } catch (error) {
      sendReplyToCommand(socket, error.message);
      return;
    }
  },
};
