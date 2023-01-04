// all in lower case
// TO = Tournament Organizer
export const TOsArray = [
  'tyrrox',
  'glorious',
  'goofy',
  'raytrout',
  'starkrush',
  'secretaccount8594',
];

export function isTO(username: string): boolean {
  return TOsArray.includes(username.toLowerCase());
}
