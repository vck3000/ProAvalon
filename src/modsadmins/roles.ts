import SiteRole from '../models/siteRole';
import { PowerRole } from '../models/types/siteRole';

class RoleStore {
  constructor(private role: PowerRole) {
    this.refreshRole();
  }

  async refreshRole() {
    try {
      const foundRoles = await SiteRole.find({ role: this.role }).lean();

      this.roleSet.clear();

      for (const foundRole of foundRoles) {
        this.roleSet.add(foundRole.usernameLower);
      }

      console.log(
        `[ROLE_STORE] Loaded ${this.roleSet.size} ${this.role}s`,
      );
    } catch (err) {
      console.log(`[ROLE_STORE] Failed to refresh ${this.role} cache:`, err);
    }
  }

  isRole(username: string): boolean {
    return this.roleSet.has(username.toLowerCase());
  }

  getRoleArray(): string[] {
    return Array.from(this.roleSet);
  }

  private roleSet = new Set<string>();
}

export const ModStore = new RoleStore(PowerRole.Moderator);
export const PercivalStore = new RoleStore(PowerRole.Percival);
export const TOStore = new RoleStore(PowerRole.TournamentOrganizer);
