// all in lower case
const modsArray = [
  'pronub',
  'starbird1002',
  'besjbo',
  'not.me',
  'anders',
  'manuavalon',
  'maximovic96',
  'd8nitemike',
];

export default modsArray;

export function isMod(username: string): boolean {
  return modsArray.includes(username.toLowerCase());
}
