import { Command } from '../types';
import { isPercival } from '../../../modsadmins/percivals';

export const pban: Command = {
  command: 'pban',
  help: '/pban: Open the ban interface',
  run: async (data, senderSocket) => {
    // @ts-ignore
    if (isPercival(senderSocket.request.user.username)) {
      senderSocket.emit('openModModal');

      senderSocket.emit('messageCommandReturnStr', {
        message: 'May your judgement bring peace to all!',
        classStr: 'server-text',
      });
    }
  },
};
