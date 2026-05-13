import { ModStore, PercivalStore } from './roles';

export function modOrTOString(username: string): string {
  if (ModStore.isRole(username)) {
    return 'Moderator';
  }
  if (PercivalStore.isRole(username)) {
    return 'Tournament Organizer';
  }

  return 'Undefined';
}
