// Note, action types must be split out here. Cannot collect into one object.
// Doing so will conflict with Typescript's object type detection in reducers.ts.
export const SET_PLAYERS = 'SET_PLAYERS';

export type Reward = 'badge' | 'winner';

export interface IPlayer {
  username: string;
  extras?: [Reward];
}

// Redux actions
export interface ISetPlayersAction {
  type: typeof SET_PLAYERS;
  players: IPlayer[];
}

export type PlayersActionTypes = ISetPlayersAction;
