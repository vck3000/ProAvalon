// all in lower case
export const modsArray = [
  'pronub',
  'starbird1002',
  'besjbo',
  'not.me',
  'manuavalon',
  'maximovic96',
  'd8nitemike',
];

export function isMod(username: string): boolean {
  return modsArray.includes(username.toLowerCase());
}
