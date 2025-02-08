import { IUserSeasonStat } from '../../models/types/userSeasonStat';
import { Role } from '../../gameplay/gameEngine/roles/types';

export default interface IUserSeasonStatDbAdapter {
  findOrCreate(userId: string, seasonId: string): Promise<IUserSeasonStat>;
  registerGameOutcome(
    userSeasonStat: IUserSeasonStat,
    isWin: boolean,
    ratingChange: number,
    role: Role,
  ): Promise<IUserSeasonStat>;
}
