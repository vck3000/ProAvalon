// all in lower case
const adminsArray = ['pronub'];

export default adminsArray;

export function isAdmin(username: string): boolean {
  return adminsArray.includes(username.toLowerCase());
}
