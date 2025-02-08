import { IUserSeasonStat } from '../../models/types/userSeasonStat';
import { Role } from '../../gameplay/gameEngine/roles/types';

export default interface IUserSeasonStatDbAdapter {
  formatUserSeasonStat(stat: IUserSeasonStat): string;
  createStat(userId: string, seasonId: string): Promise<IUserSeasonStat>;
  getStat(userId: string, seasonId: string): Promise<IUserSeasonStat>;
  updateStat(
    userId: string,
    seasonId: string,
    isWin: boolean,
    ratingChange: number,
    role: Role,
  ): Promise<IUserSeasonStat>;
}
