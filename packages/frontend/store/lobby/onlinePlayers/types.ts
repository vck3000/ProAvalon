// Note, action types must be split out here. Cannot collect into one object.
import { OnlinePlayer } from '@proavalon/proto/lobby';

// Doing so will conflict with Typescript's object type detection in reducers.ts.
export const SET_ONLINE_PLAYERS = 'SET_ONLINE_PLAYERS';

// Redux actions
export interface ISetOnlinePlayersAction {
  type: typeof SET_ONLINE_PLAYERS;
  payload: OnlinePlayer[];
}

export type OnlinePlayersActionTypes = ISetOnlinePlayersAction;
