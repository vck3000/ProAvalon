import { Types } from 'mongoose';
import { ISeasonalStat } from '../../models/types/seasonalStats';

export default interface ISeasonalStatDbAdapter {
  parseSeasonalStat(stat: ISeasonalStat): string;
  createStat(
    userId: Types.ObjectId,
    seasonId: Types.ObjectId,
  ): Promise<ISeasonalStat>;
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
