// Note, action types must be split out here. Cannot collect into one object.
// Doing so will conflict with Typescript's object type detection in reducers.ts.
export const SET_ONLINE_PLAYERS = 'SET_ONLINE_PLAYERS';

export enum OnlinePlayerRewards {}

export interface IOnlinePlayer {
  username: string;
  rewards: OnlinePlayerRewards[];
}

// Redux actions
export interface ISetOnlinePlayersAction {
  type: typeof SET_ONLINE_PLAYERS;
  payload: IOnlinePlayer[];
}

export type OnlinePlayersActionTypes = ISetOnlinePlayersAction;
