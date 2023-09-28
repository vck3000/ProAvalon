// all in lower case
// change the devsArray elements to actual developer names
export const devsArray: string[] = [];

export function isDev(username: string): boolean {
  return devsArray.includes(username.toLowerCase());
}
