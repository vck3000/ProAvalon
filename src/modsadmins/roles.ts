import SiteRole from '../models/siteRole';
import { PowerRole } from '../models/types/siteRole';
import { isAdmin, adminsArray } from './admins';

class RoleStore {
  constructor(private role: PowerRole) {}
  private roleSet = new Set<string>();

  async refreshRole() {
    try {
      const foundRoles = await SiteRole.find(
        { role: this.role }
      ).lean();

      this.roleSet.clear();

      for (const foundRole of foundRoles) {
        this.roleSet.add(foundRole.usernameLower);
      }

      console.log(`[${this.role.toUpperCase()} CACHE] Loaded ${this.roleSet.size} ${this.role}s`);
    } catch (err) {
      console.log(`Failed to refresh ${this.role} cache:`, err);
    }
  }

  isRole(username: string): boolean {
    return isAdmin(username) || this.roleSet.has(username.toLowerCase());
  }

  getRoleArray(): string[] {
    return [...Array.from(this.roleSet), ...adminsArray];
  }
}

export const ModStore = new RoleStore(PowerRole.Moderator);
export const PercivalStore = new RoleStore(PowerRole.Percival);
export const TOStore = new RoleStore(PowerRole.TournamentOrganizer);

ModStore.refreshRole();
PercivalStore.refreshRole();
TOStore.refreshRole();
