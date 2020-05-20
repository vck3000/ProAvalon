import { LobbyGame } from '@proavalon/proto/game';

export const SET_LOBBY_GAMES = 'SET_LOBBY_GAMES';

export interface ISetLobbyGamesAction {
  type: typeof SET_LOBBY_GAMES;
  payload: LobbyGame[];
}

export type LobbyGameActionType = ISetLobbyGamesAction;
