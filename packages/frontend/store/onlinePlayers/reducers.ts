import {
  IOnlinePlayer,
  ISetOnlinePlayersAction,
  SET_ONLINE_PLAYERS,
} from './actions.types';

export interface IOnlinePlayersState {
  players: IOnlinePlayer[];
}

const initialState: IOnlinePlayersState = {
  players: [],
};

const reducer = (
  state: IOnlinePlayersState = initialState,
  action: ISetOnlinePlayersAction,
): IOnlinePlayersState => {
  switch (action.type) {
    case SET_ONLINE_PLAYERS:
      return {
        players: action.players,
      };
    default:
      return state;
  }
};

export default reducer;
