// Note, action types must be split out here. Cannot collect into one object.
// Doing so will conflict with Typescript's object type detection in reducers.ts.
export const SET_ONLINE_PLAYERS = 'SET_ONLINE_PLAYERS';

export type Reward = 'badge' | 'winner';

export interface IOnlinePlayer {
  username: string;
  extras?: [Reward];
}

// Redux actions
export interface ISetOnlinePlayersAction {
  type: typeof SET_ONLINE_PLAYERS;
  players: IOnlinePlayer[];
}

export type OnlinePlayersActionTypes = ISetOnlinePlayersAction;
