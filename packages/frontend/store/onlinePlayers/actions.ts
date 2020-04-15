import {
  SET_ONLINE_PLAYERS,
  IOnlinePlayer,
  ISetOnlinePlayersAction,
} from './actions.types';

export const setOnlinePlayers = (
  players: IOnlinePlayer[],
): ISetOnlinePlayersAction => {
  return {
    type: SET_ONLINE_PLAYERS,
    players,
  };
};
