import ISeasonDbAdapter from './season';
import ISeasonalStatDbAdapter from './seasonalStat';
import IUserDbAdapter from './user';

export default interface IDatabaseAdapter {
  season: ISeasonDbAdapter;
  seasonalStat: ISeasonalStatDbAdapter;
  user: IUserDbAdapter;
}
