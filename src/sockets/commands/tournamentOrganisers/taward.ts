import { Command } from '../types';
import User from '../../../models/user';
import ModOrg from '../../../models/modOrg';
import { isWinner, refreshWinners } from '../../../rewards/getRewards';

export const taward: Command = {
  command: 'taward',
  help: '/taward <username> [<username> <username>...]: Gives a set of players a Tournament Winner Badge.',
  async run(args, senderSocket) {
    if (!args[1]) {
      senderSocket.emit('messageCommandReturnStr', {
        message: 'Specify at least one username.',
        classStr: 'server-text',
      });
      return;
    }

    for (const arg of args) {
      if (isWinner(arg.toLowerCase())) {
        senderSocket.emit('messageCommandReturnStr', {
          message: 'This user already has a Tournament Winner Badge.',
          classStr: 'server-text',
        });
        continue;
      }

      User.findOne({ usernameLower: arg.toLowerCase() }).exec(
        (err, foundUser) => {
          if (err) {
            console.log(err);
            senderSocket.emit('messageCommandReturnStr', {
              message: 'Server error... let me know if you see this.',
              classStr: 'server-text',
            });
          } else if (foundUser) {
            const promoteData = {
              role: 'winner',
              username: foundUser.username,
              usernameLower: foundUser.usernameLower,
              promotionDate: new Date(),
            };

            ModOrg.create(promoteData).then((result) => {
              refreshWinners();
            });

            senderSocket.emit('messageCommandReturnStr', {
              message: `Awarded ${foundUser.username} with Winner Badge successfully!`,
              classStr: 'server-text',
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
