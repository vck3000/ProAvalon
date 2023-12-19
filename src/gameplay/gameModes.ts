import { getRoles as avalonGetRoles } from './avalon/indexRoles';
import { getPhases as avalonGetPhases } from './avalon/indexPhases';
import { getCards as avalonGetCards } from './avalon/indexCards';
import { getRoles as avalonBotGetRoles } from './avalonBot/indexRoles';
import { getPhases as avalonBotGetPhases } from './avalonBot/indexPhases';
import { getCards as avalonBotGetCards } from './avalonBot/indexCards';

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
  [AVALON_BOT]: {
    getRoles: avalonBotGetRoles,
    getPhases: avalonBotGetPhases,
    getCards: avalonBotGetCards,
  },
};
