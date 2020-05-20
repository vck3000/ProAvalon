import { LobbyGame } from '@proavalon/proto/game';
import { LobbyGameActionType, SET_LOBBY_GAMES } from './types';

export const setLobbyGames = (games: LobbyGame[]): LobbyGameActionType => {
  return {
    type: SET_LOBBY_GAMES,
    payload: games,
  };
};
