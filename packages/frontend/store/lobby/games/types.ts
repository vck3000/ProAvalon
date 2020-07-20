import { LobbyRoomData } from '@proavalon/proto/lobby';

export const SET_LOBBY_GAMES = 'SET_LOBBY_GAMES';

export interface ISetLobbyGamesAction {
  type: typeof SET_LOBBY_GAMES;
  payload: LobbyRoomData[];
}

export type LobbyGameActionType = ISetLobbyGamesAction;
