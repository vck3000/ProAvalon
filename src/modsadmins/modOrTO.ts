import { ModStore, PercivalStore, TOStore } from './roles';

export function modOrPercyOrTOString(username: string): string {
  if (ModStore.isRole(username)) {
    return 'Moderator';
  }
  if (TOStore.isRole(username)) {
    return 'Tournament Organizer';
  }
  if (PercivalStore.isRole(username)) {
    return 'Percival';
  }

  return 'Undefined';
}
