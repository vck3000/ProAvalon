import { ISeason } from '../../models/types/season';
import { RatingBracket } from '../mongoose/season';
import { ISeasonRole } from '../../gameplay/roles/types';

export default interface ISeasonDbAdapter {
  formatSeason(season: ISeason): string;
  getCurrentSeason(): Promise<ISeason | null>;
  createSeason(
    seasonName: string,
    startDate: Date,
    endDate: Date,
    ratingBrackets: RatingBracket[],
    gameMode: string,
    rolesAvailable: ISeasonRole[],
  ): Promise<ISeason>;
}
