// all in lower case
// TO = Tournament Organizer
import ModOrg from '../models/modOrg';

export const TOSet = new Set<string>();

export async function refreshTOs() {
  try {
    const TOs = await ModOrg.find(
      { role: 'to' },
      { usernameLower: 1, _id: 0 }
    ).lean();

    TOSet.clear();

    for (const TO of TOs) {
      TOSet.add(TO.usernameLower);
    }

    console.log(`[TO CACHE] Loaded ${TOSet.size} TOs`);
  } catch (err) {
    console.log("Failed to refresh TO cache:", err);
  }
}

export function isTO(username: string): boolean {
  return TOSet.has(username.toLowerCase());
}
