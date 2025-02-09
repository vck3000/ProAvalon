import { IUserSeasonStat } from '../../models/types/userSeasonStat';
import { Role } from '../../gameplay/gameEngine/roles/types';
import { RatingBracketName } from '../../gameplay/elo/ratingBrackets';

export default interface IUserSeasonStatDbAdapter {
  findOrCreateStat(userId: string, seasonId: string): Promise<IUserSeasonStat>;
  registerGameOutcome(
    userSeasonStat: IUserSeasonStat,
    isWin: boolean,
    rating: number,
    ratingBracket: RatingBracketName,
    numPlayers: number,
    role: Role,
  ): Promise<IUserSeasonStat>;
}
