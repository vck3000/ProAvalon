import { LobbyRoomData } from '@proavalon/proto/lobby';
import { LobbyGameActionType, SET_LOBBY_GAMES } from './types';

export const setLobbyGames = (games: LobbyRoomData[]): LobbyGameActionType => {
  return {
    type: SET_LOBBY_GAMES,
    payload: games,
  };
};
