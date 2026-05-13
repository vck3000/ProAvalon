import ISiteRoleDbAdapter from '../databaseInterfaces/siteRole';
import { ISiteRole } from '../../models/types/siteRole';
import SiteRole from '../../models/siteRole';

export class MongoSiteRoleAdapter implements ISiteRoleDbAdapter {
  async getSiteRole(username: string): Promise<ISiteRole> {
    return (await SiteRole.findOne({
      usernameLower: username.toLowerCase(),
    })) as ISiteRole;
  }
}
