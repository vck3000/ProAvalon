import { ISeason } from '../../models/types/season.types';

export default interface ISeasonDbAdapter {
  parseSeason(season: ISeason): string;
  getCurrentSeason(): Promise<ISeason | null>;
  createSeason(seasonName: string): Promise<ISeason>;
  resetSeason(newSeasonName: string): Promise<void>;
}
