import { getRoles as avalonGetRoles } from './avalon/indexRoles';
import { getPhases as avalonGetPhases } from './avalon/indexPhases';
import { getCards as avalonGetCards } from './avalon/indexCards';

export enum GameMode {
  AVALON = 'avalon',
  AVALON_BOT = 'avalonBot',
}

export const GAME_MODE_NAMES = [GameMode.AVALON /*, AVALON_BOT*/];

export function strToGameMode(gameMode: string): GameMode {
  switch (gameMode) {
    case GameMode.AVALON:
      return GameMode.AVALON;
    case GameMode.AVALON_BOT:
      return GameMode.AVALON_BOT;
    default: {
      const errStr = `Invalid gameMode string. Got ${gameMode}`;
      console.warn(errStr);
      throw new Error(errStr);
    }
  }
}

// TODO remove this
export const isGameMode = (gameMode: string) => {
  return GAME_MODE_NAMES.indexOf(strToGameMode(gameMode)) !== -1;
};

export const gameModeObj = {
  [GameMode.AVALON]: {
    getRoles: avalonGetRoles,
    getPhases: avalonGetPhases,
    getCards: avalonGetCards,
  },
};
