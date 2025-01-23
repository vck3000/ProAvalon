import { Types } from 'mongoose';
import { ISeasonalStat } from '../../models/types/seasonalStats.types';

export default interface ISeasonalStatDbAdapter {
  parseSeasonalStat(stat: ISeasonalStat): string;
  getStat(userId: Types.ObjectId, seasonId: string): Promise<ISeasonalStat>;
  updateStat(
    userId: Types.ObjectId,
    seasonId: string,
    isWin: boolean,
    ratingChange: number,
  ): Promise<ISeasonalStat>;
}
