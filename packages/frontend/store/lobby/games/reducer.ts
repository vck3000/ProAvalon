import { LobbyRoomData } from '@proavalon/proto/lobby';
import { SET_LOBBY_GAMES, LobbyGameActionType } from './types';

const initialState: LobbyRoomData[] = [];

const reducer = (
  state: LobbyRoomData[] = initialState,
  action: LobbyGameActionType,
): LobbyRoomData[] => {
  switch (action.type) {
    case SET_LOBBY_GAMES:
      return [...action.payload];
    default:
      return state;
  }
};

export default reducer;
