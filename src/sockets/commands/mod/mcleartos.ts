import { Command } from '../types';
import ModOrg from '../../../models/modOrg';
import ModLog from '../../../models/modLog';
import { refreshTOs } from '../../../modsadmins/tournamentOrganizers';

export const mcleartos: Command = {
  command: 'mcleartos',
  help: '/mcleartos: Removes TO role from all players.',
  async run(args, senderSocket) {
    const senderUsername: string = senderSocket.request.user.username;
    ModOrg.deleteMany({ role: 'to' })
      .then((result) => {
        senderSocket.emit('messageCommandReturnStr', {
          message: `Deleted ${result.deletedCount} TO roles.`,
          classStr: 'server-text',
        });
        refreshTOs();
        ModLog.create({
          type: 'clear',
          modWhoMade: {
            // @ts-ignore
            id: senderSocket.request.user.id,
            username: senderUsername,
            usernameLower: senderUsername.toLowerCase(),
          },
          data: { role: 'to', deletedCount: result.deletedCount },
          dateCreated: new Date(),
        });
      })
      .catch((err) => console.error(err));
  },
};
