import { Types } from 'mongoose';
import User from '../models/user';
import RatingPeriodGameRecord from '../models/RatingPeriodGameRecord';
import Rank from '../models/rank';
import type { IRatingPeriodGameRecord } from '../models/types';
import { IRank, IUser } from '../models/types';

export default class Mongo {
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
    username = username.toLowerCase();

    return RatingPeriodGameRecord.find({
      $or: [{ spyTeam: username }, { resistanceTeam: username }],
    }).exec();
  }

  static async getRankByUserId(userId: string): Promise<IRank> {
    const user = await this.getUserByUserId(userId);
    return Rank.findOne({
      _id: user.currentRanking,
    }).exec();
  }
}
