// all in lower case
export const adminsArray = ['pronub'];

export function isAdmin(username: string): boolean {
  return adminsArray.includes(username.toLowerCase());
}
