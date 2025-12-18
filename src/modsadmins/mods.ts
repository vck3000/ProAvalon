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

export function isMod(username: string): boolean {
  return modsArray.includes(username.toLowerCase());
}
