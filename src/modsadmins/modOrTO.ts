import { isMod } from './mods';
import { isTO } from './tournamentOrganizers';

export function modOrTOString(username: string): string {
  if (isMod(username)) {
    return 'Moderator';
  }
  if (isTO(username)) {
    return 'Tournament Organizer';
  }

  return 'Undefined';
}
