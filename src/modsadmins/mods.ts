import ModOrg from '../models/modOrg';
// all in lower case
export const modsArray = [
  'pronub',
  'kage',
  'besjbo',
  'maximovic96',
  'goofy', // jams
  'sadnixon',
  'fossa',
];

export const modSet = new Set<string>();

export async function refreshMods() {
  try {
    const mods = await ModOrg.find(
      { role: 'moderator' },
      { usernameLower: 1, _id: 0 }
    ).lean();

    modSet.clear();

    for (const mod of mods) {
      modSet.add(mod.usernameLower);
    }

    console.log(`[MOD CACHE] Loaded ${modSet.size} moderators`);
  } catch (err) {
    console.log("Failed to refresh mod cache:", err);
  }
}

export function isMod(username: string): boolean {
  return modSet.has(username.toLowerCase());
}

export function getModArray() {
  return Array.from(modSet);
}

//export function isMod(username: string): boolean {
//  return modsArray.includes(username.toLowerCase());
//}