import { SET_PLAYERS, IPlayer, ISetPlayersAction } from './actions.types';

export const setPlayers = (players: IPlayer[]): ISetPlayersAction => {
  return {
    type: SET_PLAYERS,
    players,
  };
};
