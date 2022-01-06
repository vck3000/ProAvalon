// all in lower case
// TO = Tournament Organizer
export const TOsArray = ['tyrrox', 'glorious', 'goofy', 'portujules', 'raytrout'];

export function isTO(username: string): boolean {
  return TOsArray.includes(username.toLowerCase());
}
