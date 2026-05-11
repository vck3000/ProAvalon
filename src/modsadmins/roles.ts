import SiteRole from '../models/siteRole';

class RoleStore {
  constructor(private role: string) {}
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
    return this.roleSet.has(username.toLowerCase());
  }

  getRoleArray(): string[] {
    return Array.from(this.roleSet);
  }
}

export const ModStore = new RoleStore("moderator");
export const PercivalStore = new RoleStore("percival");
export const TOStore = new RoleStore("to");
