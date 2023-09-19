// all in lower case
// TO = Tournament Organizer
export const TOsArray = [
  // Manu's TOs
  'manuavalon',
  'tyrrox',
  'glorious',
  'goofy',
  'starkrush',
  'secretaccount8594',
  'pat',

  // Ref-rain's TOs
  'ref-rain',
  'wolfbloodwitch',
  'altwoa',
];

export function isTO(username: string): boolean {
  return TOsArray.includes(username.toLowerCase());
}
