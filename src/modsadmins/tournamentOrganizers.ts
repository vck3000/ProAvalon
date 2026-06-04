// all in lower case
// TO = Tournament Organizer
export const TOsArray: string[] = [
  'ingenue',
  'glorious',
  'mirroringhim',
  'feelsriddle',
  'eevee',
  'bellzzzz',
  'datboi',
];

export function isTO(username: string): boolean {
  return TOsArray.includes(username.toLowerCase());
}
