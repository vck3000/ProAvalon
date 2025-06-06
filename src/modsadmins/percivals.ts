// Note this is a site Percival role that assists the Mods with site moderation.
// It is not the Percival role in Avalon gameplay.

// all in lower case
export const percivalsArray: string[] = [
  'percytest',
  'manuavalon',
  'imbapingu',
  'gawaine',
  'jsm',
  'not.me',
  'sb',
  'obeymrwalrus',
];

export function isPercival(username: string): boolean {
  return percivalsArray.includes(username.toLowerCase());
}