import { ISiteRole } from '../../models/types/siteRole';

export default interface ISiteRoleDbAdapter {
  getSiteRole(username: string): Promise<ISiteRole>;
}
