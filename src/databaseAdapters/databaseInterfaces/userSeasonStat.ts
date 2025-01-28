import { Types } from 'mongoose';
import { IUserSeasonStat } from '../../models/types/userSeasonStat';
import { Role } from '../../gameplay/roles/types';

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
    role: Role,
  ): Promise<IUserSeasonStat>;
}
