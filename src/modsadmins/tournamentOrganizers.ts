// all in lower case
// TO = Tournament Organizer
export const TOsArray: string[] = [];

export function isTO(username: string): boolean {
  return TOsArray.includes(username.toLowerCase());
}
