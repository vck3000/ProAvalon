// all in lower case
// change the devsArray elements to actual developer names 
export const devsArray = [
  'c0nradd',
  'cin333',
  'zulf16',
];

export function isDev(username: string): boolean {
  return devsArray.includes(username.toLowerCase());
}