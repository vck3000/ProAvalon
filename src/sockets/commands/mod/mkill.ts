import { Command } from '../types';

export const mkill: Command = {
  command: 'mkill',
  help: '/mkill: Kills the server triggering an immediate restart.',
  run() {
    process.exit(0);
  },
};
