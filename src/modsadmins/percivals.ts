// Note this is a site Percival role that assists the Mods with site moderation.
// It is not the Percival role in Avalon gameplay.
import ModOrg from '../models/modOrg';

export const percivalSet = new Set<string>();

export async function refreshPercivals() {
  try {
    const percivals = await ModOrg.find(
      { role: 'percival' },
      { usernameLower: 1, _id: 0 }
    ).lean();

    percivalSet.clear();

    for (const percival of percivals) {
      percivalSet.add(percival.usernameLower);
    }

    console.log(`[PERCIVAL CACHE] Loaded ${percivalSet.size} percivals`);
  } catch (err) {
    console.log("Failed to refresh percival cache:", err);
  }
}

export function isPercival(username: string): boolean {
  return percivalSet.has(username.toLowerCase());
}
