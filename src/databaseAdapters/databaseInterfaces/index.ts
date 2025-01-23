import IUserDbAdapter from './user';
import ISeasonDbAdapter from './season';

export default interface IDatabaseAdapter {
  user: IUserDbAdapter;
  season: ISeasonDbAdapter;
}
