// all in lower case
// TO = Tournament Organizer
export const TOsArray: string[] = ['Tree3', 'Ref-Rain'];

export function isTO(username: string): boolean {
  return TOsArray.includes(username.toLowerCase());
}
