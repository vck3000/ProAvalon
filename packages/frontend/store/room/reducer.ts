import { RoomData, GameMode, RoomState } from '@proavalon/proto/room';
import { RoomActionTypes, SET_ROOM } from './types';

const initialState: RoomData = {
  state: RoomState.waiting,
  id: -1,
  host: 'undefined',
  mode: GameMode.AVALON,
  roles: [],
  kickedPlayers: [],
  playerData: [],
  spectatorData: [],
  gameBarMsg: '',
};

const reducer = (state = initialState, action: RoomActionTypes): RoomData => {
  switch (action.type) {
    case SET_ROOM:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
