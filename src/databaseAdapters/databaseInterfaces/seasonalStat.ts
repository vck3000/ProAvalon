import { Types } from 'mongoose';
import { ISeasonalStat } from '../../models/types/seasonalStats.types';

export default interface ISeasonalStatDbAdapter {
  parseSeasonalStat(stat: ISeasonalStat): string;
  getStat(
    userId: Types.ObjectId,
    seasonId: Types.ObjectId,
  ): Promise<ISeasonalStat>;
  updateStat(
    userId: Types.ObjectId,
    seasonId: Types.ObjectId,
    isWin: boolean,
    ratingChange: number,
  ): Promise<ISeasonalStat>;
}
