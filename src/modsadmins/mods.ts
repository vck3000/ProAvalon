// all in lower case
export const modsArray = [
  'pronub',
  'besjbo',
  'maximovic96',
  'ingenue',
  'goofy', // jams
  'sadnixon',
  'fossa',
  '1',
];

// TODO-kev: Remove

export function isMod(username: string): boolean {
  return modsArray.includes(username.toLowerCase());
}
