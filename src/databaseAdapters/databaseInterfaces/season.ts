import { ISeason } from '../../models/types/season';
import { RatingBracket } from '../../gameplay/elo/types';

export default interface ISeasonDbAdapter {
  getCurrentSeason(): Promise<ISeason | null>;
  createSeason(
    seasonName: string,
    startDate: Date,
    endDate: Date,
    ratingBrackets: RatingBracket[],
  ): Promise<ISeason>;
}
