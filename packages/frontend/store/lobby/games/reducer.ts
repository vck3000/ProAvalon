import { LobbyGame } from '@proavalon/proto/game';
import { SET_LOBBY_GAMES, LobbyGameActionType } from './types';

const initialState: LobbyGame[] = [];

const reducer = (
  state: LobbyGame[] = initialState,
  action: LobbyGameActionType,
): LobbyGame[] => {
  switch (action.type) {
    case SET_LOBBY_GAMES:
      return [...action.payload];
    default:
      return state;
  }
};

export default reducer;
