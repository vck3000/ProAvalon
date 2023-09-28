// all in lower case
// TO = Tournament Organizer
export const TOsArray = [
  'glorious',
  'wolfbloodwitch',
  'altwoa',
  'bremen',
  'pat',
];

export function isTO(username: string): boolean {
  return TOsArray.includes(username.toLowerCase());
}
