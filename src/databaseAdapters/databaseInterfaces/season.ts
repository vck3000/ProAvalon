import { ISeason } from '../../models/types/season.types';

export default interface ISeasonDbAdapter {
  getCurrentSeason(): Promise<ISeason | null>;
  createSeason(seasonName: string): Promise<ISeason>;
  resetSeason(newSeasonName: string): Promise<void>;
}
