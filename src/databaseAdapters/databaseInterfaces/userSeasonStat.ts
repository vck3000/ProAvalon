import { Types } from 'mongoose';
import { IUserSeasonStat } from '../../models/types/userSeasonStat';

export default interface IUserSeasonStatDbAdapter {
  formatUserSeasonStat(stat: IUserSeasonStat): string;
  createStat(
    userId: Types.ObjectId,
    seasonId: Types.ObjectId,
  ): Promise<IUserSeasonStat>;
  getStat(
    userId: Types.ObjectId,
    seasonId: Types.ObjectId,
  ): Promise<IUserSeasonStat>;
  updateStat(
    userId: Types.ObjectId,
    seasonId: Types.ObjectId,
    isWin: boolean,
    ratingChange: number,
  ): Promise<IUserSeasonStat>;
}
