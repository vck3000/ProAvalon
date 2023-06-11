import { Types } from 'mongoose';
import User from '../models/user';
import RatingPeriodGameRecord from '../models/RatingPeriodGameRecord';
import Rank from '../models/rank';
import type { IRatingPeriodGameRecord } from '../models/types';
import { IRank, IUser } from '../models/types';

export default class Mongo {
  static async updateAllUsersRankByFn(
    updateFn: (userId: string) => Promise<IRank>,
  ): Promise<void> {
    try {
      const cursor = User.find({ currentRanking: { $ne: null } }).cursor();
      const promises = [];

      let doc = await cursor.next();

      while (doc != null) {
        promises.push(
          (async (user: IUser) => {
            try {
              const updatedRank = await updateFn(user._id.toString());
              await this.updateRankRatings(user._id.toString(), updatedRank);
            } catch (error) {
              console.error(
                `Error while updating rank for user ${user._id}:`,
                error,
              );
              throw error;
            }
          })(doc),
        );

        doc = await cursor.next();
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('An error occurred while updating user ranks:', error);
      throw error;
    }
  }

  static async getUserByUsername(username: string): Promise<IUser> {
    try {
      const user = await User.findOne({
        usernameLower: username.toLowerCase(),
      });
      if (!user) {
        throw new Error(`Could not find user: ${username}`);
      }
  
      return user;
    } catch (error) {
      console.error('An error occurred while fetching the user:', error);
      throw error;
    }
  }

  static async getUserByUserId(userId: string): Promise<IUser> {
    try {
      const user = await User.findOne({ _id: new Types.ObjectId(userId) });
  
      if (!user) {
        throw Error(`Could not find user id: ${userId}`);
      }
  
      return user;
    } catch (error) {
      console.error(`An error occurred while fetching user ${userId}:`, error);
      throw error;
    }
  }

  static async getRatingPeriodGamesByUsername(
    username: string,
  ): Promise<IRatingPeriodGameRecord[]> {
    try {
      const usernameLower = username.toLowerCase();

      return await RatingPeriodGameRecord.find({
        $or: [{ spyTeam: usernameLower }, { resistanceTeam: usernameLower }],
      });
    } catch (error) {
      console.error(
        'An error occurred while fetching rating period game records:',
        error,
      );
      throw error;
    }
  }

  static async getUserRankByUserId(userId: string): Promise<IRank> {
    try {
      const user = await this.getUserByUserId(userId);
      const rank = await Rank.findOne({
        _id: user.currentRanking,
      });
  
      if (!rank) {
        throw new Error(`Could not find rank for user id: ${userId}`);
      }
  
      return rank;
    } catch (error) {
      console.error('An error occurred while fetching the rank:', error);
      throw error;
    }
  }

  static async getUserRankByUsername(username: string): Promise<IRank> {
    try {
      const usernameLower = username.toLowerCase();
  
      const user = await this.getUserByUsername(usernameLower);
      const rank = await Rank.findOne({
        _id: user.currentRanking,
      });
  
      if (!rank) {
        throw new Error(`Could not find rank for username: ${usernameLower}`);
      }
  
      return rank;
    } catch (error) {
      console.error('An error occurred while fetching the rank:', error);
      throw error;
    }
  }

  static async updateRankRatings(
    userId: string,
    updatedRank: IRank,
  ): Promise<void> {
    try {
      const { playerRating, rd, volatility } = updatedRank;

      await Rank.updateOne(
        {
          userId,
        },
        {
          playerRating,
          rd,
          volatility,
        },
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async clearRatingPeriodGameRecords(): Promise<void> {
    try {
      await RatingPeriodGameRecord.deleteMany({});
      console.log('All documents in RatingPeriodGameRecord have been deleted');
    } catch (error) {
      console.error('An error occurred while deleting documents:', error);
      throw error;
    }
  }
}
