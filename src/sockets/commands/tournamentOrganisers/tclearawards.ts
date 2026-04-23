import { Command } from '../types';
import ModOrg from '../../../models/modOrg';
import { refreshWinners } from '../../../rewards/getRewards';

export const tclearawards: Command = {
  command: 'tclearawards',
  help: '/tclearawards: Removes Tournament Winner Badge from all players.',
  async run(args, senderSocket) {
    ModOrg.deleteMany({ role: 'winner' })
      .then((result) => {
        senderSocket.emit('messageCommandReturnStr', {
          message: `Deleted ${result.deletedCount} Winner Badges.`,
          classStr: 'server-text',
        });
        refreshWinners();
      })
      .catch((err) => console.error(err));
  },
};
