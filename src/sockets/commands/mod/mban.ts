import { Command } from '../types';
import { isMod } from '../../../modsadmins/mods';

export const mban: Command = {
  command: 'mban',
  help: '/mban: Open the ban interface',
  run: async (data, senderSocket) => {
    // TODO
    // @ts-ignore
    if (isMod(senderSocket.request.user.username)) {
      senderSocket.emit('openModModal');

      senderSocket.emit('messageCommandReturnStr', {
        message: 'May your judgement bring peace to all!',
        classStr: 'server-text',
      });
    }
  },
};
