import {
  IOnlinePlayer,
  ISetOnlinePlayersAction,
  SET_ONLINE_PLAYERS,
} from './types';

export type OnlinePlayersState = IOnlinePlayer[];

const initialState: OnlinePlayersState = [];

const reducer = (
  state: OnlinePlayersState = initialState,
  action: ISetOnlinePlayersAction,
): OnlinePlayersState => {
  switch (action.type) {
    case SET_ONLINE_PLAYERS:
      return [...action.payload];
    default:
      return state;
  }
};

export default reducer;
