import { Command } from '../types';
import ModOrg from '../../../models/modOrg';

export const mallrole: Command = {
  command: 'mallrole',
  help: '/mallrole <role>: Get a list of all players from a role.',
  async run(args, senderSocket) {
    if (!args[1]) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Specify a role.',
        classStr: 'server-text',
      });
      return;
    } else if (
      !['moderator', 'to', 'percival', 'winner'].includes(args[1].toLowerCase())
    ) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Invalid role name.',
        classStr: 'server-text',
      });
      return;
    }

    const targetRole = args[1].toLowerCase();

    ModOrg.find({ role: targetRole }, { username: 1, _id: 0 }).exec(
      (err, foundList) => {
        if (err) {
          console.log(err);
          senderSocket.emit('messageCommandReturnStr', {
            message: 'Server error... let me know if you see this.',
            classStr: 'server-text',
          });
        } else if (foundList.length > 0) {
          const roleUsernames = foundList.map(doc => doc.username);
          senderSocket.emit('messageCommandReturnStr', {
            message: `Current members of the ${targetRole.toUpperCase()} role:\n${roleUsernames.join(', ')}.`,
            classStr: 'server-text',
          });
        } else {
          senderSocket.emit('messageCommandReturnStr', {
            message: `Found no users in the ${targetRole.toUpperCase()} role.`,
            classStr: 'server-text',
          });
        }
      },
    );
  },
};
