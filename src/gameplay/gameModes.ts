import { getRoles as avalonGetRoles } from './avalon/indexRoles';
import { getPhases as avalonGetPhases } from './avalon/indexPhases';
import { getCards as avalonGetCards } from './avalon/indexCards';

export const AVALON = 'avalon';
export const AVALON_BOT = 'avalonBot';
export const GAME_MODE_NAMES = [AVALON /*, AVALON_BOT*/];

export const isGameMode = (gameMode: string) => {
  return GAME_MODE_NAMES.indexOf(gameMode) !== -1;
};

export const gameModeObj = {
  [AVALON]: {
    getRoles: avalonGetRoles,
    getPhases: avalonGetPhases,
    getCards: avalonGetCards,
  },
};
