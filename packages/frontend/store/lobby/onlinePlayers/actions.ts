import { OnlinePlayer } from '@proavalon/proto/lobby';
import { SET_ONLINE_PLAYERS, OnlinePlayersActionTypes } from './types';

export const setOnlinePlayers = (
  players: OnlinePlayer[],
): OnlinePlayersActionTypes => {
  return {
    type: SET_ONLINE_PLAYERS,
    payload: players,
  };
};
