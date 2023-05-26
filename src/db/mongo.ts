import { Types } from 'mongoose';
import User from '../models/user';
import RatingPeriodGameRecord from '../models/RatingPeriodGameRecord';
import Rank from '../models/rank';
import type { IRatingPeriodGameRecord } from '../models/types';
import { IRank, IUser } from '../models/types';

export default class Mongo {
  static getAllUsers(): Promise<IUser[]> {
    return User.find({}).exec();
  }

  static async updateAllUsersRankByFn(updateFn: (userId: string) => Promise<IRank>): Promise<void> {
    User
      .find({})
      .cursor()
      .eachAsync(async (user: IUser) => {
        const updatedRank = await updateFn(user._id.toString());
        await this.updateRankRatings(user._id.toString(), updatedRank);
      });
  }

  static getUserByUsername(username: string): Promise<IUser> {
    const user = User.findOne({ usernameLower: username.toLowerCase() }).exec();
    if (!user) {
      throw Error(`Could not find user: ${username}`);
    }

    return user;
  }

  static getUserByUserId(userId: string): Promise<IUser> {
    const user = User.findOne({ _id: new Types.ObjectId(userId) }).exec();

    if (!user) {
      throw Error(`Could not find user id: ${userId}`);
    }

    return user;
  }

  static getGamesByUsername(
    username: string,
  ): Promise<IRatingPeriodGameRecord[]> {
    const usernameLower = username.toLowerCase();

    return RatingPeriodGameRecord.find({
      $or: [{ spyTeam: usernameLower }, { resistanceTeam: usernameLower }],
    }).exec();
  }

  static async getUserRankByUserId(userId: string): Promise<IRank> {
    const user = await this.getUserByUserId(userId);
    const rank = Rank.findOne({
      _id: user.currentRanking,
    }).exec();

    if (!rank) {
      throw Error(`Could not find rank for user id: ${userId}`);
    }

    return rank;
  }

  static async getUserRankByUsername(username: string): Promise<IRank> {
    const usernameLower = username.toLowerCase();

    const user = await this.getUserByUsername(usernameLower);
    const rank = Rank.findOne({
      _id: user.currentRanking,
    }).exec();

    if (!rank) {
      throw Error(`Could not find rank for username: ${usernameLower}`);
    }

    return rank;
  }

  static async updateRankRatings(userId: string, updatedRank: IRank): Promise<void> {
    const { playerRating, rd, volatility } = updatedRank;

    await Rank.updateOne({
      userId
    }, {
      playerRating,
      rd,
      volatility,
    });
  }
}
