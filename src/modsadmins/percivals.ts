// Note the Percival role assists the Mods with site moderation.
// It is not the role in Avalon gameplay.

// all in lower case
export const percivalsArray: string[] = [];

export function isPercival(username: string): boolean {
  return percivalsArray.includes(username.toLowerCase());
}
