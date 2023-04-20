import { Command } from '../types';
import { SocketUser } from '../../types';
import User from '../../../models/user';
import seasonNumber from '../../../util/seasonNumber';

export const areset: Command = {
  command: 'reset',
  help: "/reset all plyers's rank data and start a new season",
  run: async (args: string[], socket: SocketUser) => {
    try {
      const users = await User.find({});
      for (const user of users) {
        const previousRankData = {
          seasonNumber: seasonNumber.getSeasonNumber() ,
          rating: user.playerRating,
          ratingBracket: user.ratingBracket,
        };
        user.previousRankData.push(previousRankData);
        user.playerRating = 1500;
        user.ratingBracket = 'silver';
        user.rd = 350;
        user.volatility = 0.06;
        await user.save();
      }
      seasonNumber.setSeasonNumber(seasonNumber.getSeasonNumber() + 1);
      console.log('Season number: ', seasonNumber.getSeasonNumber());
    } catch (err) {
      console.error(err);
      socket.emit('messageCommandReturnStr', {
        message: 'Something went wrong when resetting the data',
        classStr: 'server-text',
      });
      return;
    }

    // return message to client
    socket.emit('messageCommandReturnStr', {
      message: 'All players rank data has been reset.',
      classStr: 'server-text',
    });
  },
};
