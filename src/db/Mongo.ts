import { Types } from 'mongoose';
import User from '../models/user';
import RatingPeriodGameRecord from '../models/RatingPeriodGameRecord';
import Rank from '../models/rank';
import { IRank, IUser } from '../models/types';
import type { IRatingPeriodGameRecord } from '../models/types';

export default class Mongo
{
  static getUserByUsername(username: string): Promise<IUser | null> {
    return User.findOne({ usernameLower: username.toLowerCase() }).exec();
  }

  static getUserByUserId(userId: string): Promise<IUser | null> {
    return User.findOne({ _id: new Types.ObjectId(userId) }).exec();
  }

  static getGamesByUserId(userId: string): Promise<IRatingPeriodGameRecord[]> {
    const userObjectId = new Types.ObjectId(userId);
    return RatingPeriodGameRecord.find({
      $or: [{ spyTeam: userObjectId }, { resistanceTeam: userObjectId }],
    }).exec();
  }

  static async getRankByUserId(userId: string): Promise<IRank> {
    const user = await this.getUserByUserId(userId);
    return Rank.findOne({
      _id: user.currentRanking,
    }).exec();
  }
}
