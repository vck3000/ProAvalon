// all in lower case
export const modsArray = [
  'pronub',
  'besjbo',
  'not.me',
  'manuavalon',
  'maximovic96',
  'd8nitemike',
  'ingenue',
  'goofy', // jams
  'sadnixon',
];

export function isMod(username: string): boolean {
  return modsArray.includes(username.toLowerCase());
}
