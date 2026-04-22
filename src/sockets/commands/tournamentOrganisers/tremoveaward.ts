import { Command } from '../types';
import ModOrg from '../../../models/modOrg';
import { refreshWinners } from '../../../rewards/getRewards';

export const tremoveaward: Command = {
  command: 'tremoveaward',
  help: '/tremoveaward <username> [<username> <username>...]: Removes Tournament Winner Badge from a set of players.',
  async run(args, senderSocket) {
    if (!args[1]) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Specify at least one username.',
        classStr: 'server-text',
      });
      return;
    }

    for (const arg of args) {
      ModOrg.findOne({ usernameLower: arg.toLowerCase(), role: 'winner' }).exec(
        (err, foundUser) => {
          if (err) {
            console.log(err);
            senderSocket.emit('messageCommandReturnStr', {
              message: 'Server error... let me know if you see this.',
              classStr: 'server-text',
            });
          } else if (foundUser) {
            foundUser.deleteOne((err) => {
              if (err) {
                console.log(err);
                senderSocket.emit('messageCommandReturnStr', {
                  message: 'Server error... let me know if you see this.',
                  classStr: 'server-text',
                });
              } else {
                senderSocket.emit('messageCommandReturnStr', {
                  message: `Removed Winner Badge from ${foundUser.username} successfully!`,
                  classStr: 'server-text',
                });
                refreshWinners();
              }
            });
          } else {
            senderSocket.emit('messageCommandReturnStr', {
              message: `Could not find ${arg}`,
              classStr: 'server-text',
            });
          }
        },
      );
    }
  },
};
