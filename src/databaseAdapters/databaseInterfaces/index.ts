import ISeasonDbAdapter from './season';
import IUserSeasonStatDbAdapter from './userSeasonStat';
import IUserDbAdapter from './user';
import ISiteRole from './siteRole';

export default interface IDatabaseAdapter {
  season: ISeasonDbAdapter;
  user: IUserDbAdapter;
  userSeasonStat: IUserSeasonStatDbAdapter;
  siteRole: ISiteRole;
}
