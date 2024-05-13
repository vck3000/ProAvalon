export enum GameMode {
  AVALON = 'avalon',
  AVALON_BOT = 'avalonBot',
  SINAD = 'sinad'
}

export const GAME_MODE_NAMES = [GameMode.AVALON, GameMode.SINAD, /*, AVALON_BOT*/];

export function strToGameMode(gameMode: string): GameMode {
  switch (gameMode) {
    case GameMode.AVALON:
      return GameMode.AVALON;
    case GameMode.AVALON_BOT:
      return GameMode.AVALON_BOT;
    case GameMode.SINAD:
      return GameMode.SINAD;
      
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
