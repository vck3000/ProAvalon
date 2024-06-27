// all in lower case
// TO = Tournament Organizer
export const TOsArray: string[] = [
  'pat',
  'pandamania',
  'glorious',
  'manuavalon',
  'bremen',
  'starkrush',
  'secretwoa',
];

export function isTO(username: string): boolean {
  return TOsArray.includes(username.toLowerCase());
}
