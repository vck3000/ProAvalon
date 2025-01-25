import { ISeason } from '../../models/types/season';
import { RatingBracket } from '../mongoose/season';

export default interface ISeasonDbAdapter {
  parseSeason(season: ISeason): string;
  getCurrentSeason(): Promise<ISeason | null>;
  createSeason(
    seasonName: string,
    startDate: Date,
    endDate: Date,
    ratingBrackets: RatingBracket[],
  ): Promise<ISeason>;
}
