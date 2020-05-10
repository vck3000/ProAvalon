import {
  SET_ONLINE_PLAYERS,
  IOnlinePlayer,
  OnlinePlayersActionTypes,
} from './types';

export const setOnlinePlayers = (
  players: IOnlinePlayer[],
): OnlinePlayersActionTypes => {
  return {
    type: SET_ONLINE_PLAYERS,
    payload: players,
  };
};
