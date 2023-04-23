// all in lower case
// TO = Tournament Organizer
export const TOsArray = [
  // Manu's TOs
  'tyrrox',
  'glorious',
  'goofy',
  'raytrout',
  'starkrush',
  'secretaccount8594',

  // Ref-rain's TOs
  'ref-rain',
  'wolfbloodwitch',
  'bumfuzzle28',
];

export function isTO(username: string): boolean {
  return TOsArray.includes(username.toLowerCase());
}
