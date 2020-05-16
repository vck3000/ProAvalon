import { GameActionTypes, IGame, SET_GAME } from './types';

export const setGame = (payload: IGame): GameActionTypes => {
  return {
    type: SET_GAME,
    payload,
  };
};
