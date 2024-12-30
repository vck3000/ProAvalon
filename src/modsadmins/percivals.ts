// all in lower case
export const percivalsArray: string[] = [];

export function isPercival(username: string): boolean {
  return percivalsArray.includes(username.toLowerCase());
}
