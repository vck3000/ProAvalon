import { ModStore, TOStore } from './roles';

export function modOrTOString(username: string): string {
  if (ModStore.isRole(username)) {
    return 'Moderator';
  }
  if (TOStore.isRole(username)) {
    return 'Tournament Organizer';
  }

  return 'Undefined';
}
