import { Command } from '../types';
import { SocketUser } from '../../types';
import { guessmerlin } from './guessmerlin';

export const gm: Command = {
  command: 'gm',
  help: '/gm <playername>: Shortcut for /guessmerlin',
  run: async (args: string[], socket: SocketUser) => {
    return guessmerlin.run(args, socket);
  },
};
