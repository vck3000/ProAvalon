// all in lower case
// TO = Tournament Organizer
export const TOsArray: string[] = [
  'pandamania',
  'glorious',
  'manuavalon',
  'datboi',
  'secretwoa',
];

export function isTO(username: string): boolean {
  return TOsArray.includes(username.toLowerCase());
}
