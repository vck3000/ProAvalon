import { Command } from '../types';
import { PercivalStore } from '../../../modsadmins/roles';

export const pban: Command = {
  command: 'pban',
  help: '/pban: Open the ban interface',
  run: async (data, senderSocket) => {
    // @ts-ignore
    if (PercivalStore.isRole(senderSocket.request.user.username)) {
      senderSocket.emit('openModModal');

      senderSocket.emit('messageCommandReturnStr', {
        message: 'May your judgement bring peace to all!',
        classStr: 'server-text',
      });
    }
  },
};
