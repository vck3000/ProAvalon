import { Command } from '../types';
import { SocketUser } from '../../types';
import User from '../../../models/user';
import RankData from '../../../models/rank';
import SeasonNumber from '../../../models/seasonNumber';
import getSeasonNumber from '../../../elo/utils/getSeasonNumber';

// define a function to reset the elo of all users
export const astartnewrankseason: Command = {
  command: 'startnewrankseason',
  help: "/reset all players's rank data and start a new season",
  run: async (args: string[], socket: SocketUser) => {
    try {
      const users = await User.find({});
      resetElosOfUsers(users);
      seasonNumberIncrement();
    }
    catch (err) {
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

// Return the sigmoid of the rating value
function sigmoid(rating: number) {
  return 1 / (1 + Math.exp(-rating));
}

// calculate the new rating value based on the old rating value
function mapToRange(rating: number, minValue: number, maxValue: number) {
  const midValue = (minValue + maxValue) / 2;
  const sigmoided = sigmoid((rating - midValue) / 200);
  return Math.floor(minValue + (sigmoided * (maxValue - minValue)));
}


// define a function to increment the season number
async function seasonNumberIncrement() {
  try {
    let returnedSeasonNumber = await SeasonNumber.findOneAndUpdate(
      {}, 
      { $inc: { number: 1 } }, 
      { new: true });
    console.log(returnedSeasonNumber);
  } catch (err) {
    console.error(err);
  }
}
// Transaction
// @ts-ignore
async function resetElosOfUsers(users: User[]) {
  const maxRetries = 5;
  // get the current season number
  const seasonNumber = await getSeasonNumber();
  // @ts-ignore
  async function resetElo(user: User, seasonNumber: number): Promise<void> {
    try {
      await resetUserElo(user, seasonNumber);
    } catch (error) {
      throw new Error(`Failed to reset ELO for user (${user._id}:${user.username}): ${error.message}`);
    }
  }

  async function retryOperation(operation: Function, args: any[], maxRetries: number): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await operation(...args);
        return;
      } catch (error) {
        console.error(`Error occurred: ${error.message}. Retrying...`);
      }
    }
    throw new Error(`Operation failed after ${maxRetries} retries.`);
  }

  for (const user of users) {
    await retryOperation(resetElo, [user, seasonNumber], maxRetries);
  }
}

// reset the elo of a user
// @ts-ignore
async function resetUserElo(user: User, seasonNumber: number) {

  user.pastRankings.push(user.currentRanking);
  user.markModified('pastRankings');

  // const newDefaultRankData = new RankData({
  //   userId: user._id,
  //   seasonNumber: seasonNumber + 1,
  // });

  // await newDefaultRankData.save();
  // user.currentRanking = newDefaultRankData._id;

  // I think if I implement assign a default rank data after player finished their first game function right
  // I can remove the above code
  user.currentRanking = null;
  user.markModified('currentRanking');

  await user.save();
}

