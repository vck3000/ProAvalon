import ISeasonDbAdapter from './season';
import IUserSeasonStatDbAdapter from './userSeasonStat';
import IUserDbAdapter from './user';

export default interface IDatabaseAdapter {
  season: ISeasonDbAdapter;
  user: IUserDbAdapter;
  userSeasonStat: IUserSeasonStatDbAdapter;
}
