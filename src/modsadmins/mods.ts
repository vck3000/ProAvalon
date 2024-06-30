// all in lower case
export const modsArray = [
  'pronub',
  'kage',
  'besjbo',
  'maximovic96',
  'ingenue',
  'goofy', // jams
  'sadnixon',
  'fossa',
  '1',
  '2',
  '3',
  '4',
];

export function isMod(username: string): boolean {
  return modsArray.includes(username.toLowerCase());
}
