import { IPlayer, ISetPlayersAction, SET_PLAYERS } from './actions.types';

export interface IPlayersState {
  players: IPlayer[];
}

const initialState: IPlayersState = {
  players: [],
};

const reducer = (
  state: IPlayersState = initialState,
  action: ISetPlayersAction,
): IPlayersState => {
  switch (action.type) {
    case SET_PLAYERS:
      return {
        players: action.players,
      };
    default:
      return state;
  }
};

export default reducer;
