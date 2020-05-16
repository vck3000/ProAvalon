export const SET_GAME = 'SET_GAME';

// TODO: add all of the other roles
type Role = 'Resistance' | 'Spy';

export interface IPlayer {
  displayName: string;
  role?: Role;
}

interface IProposal {
  votes: {
    [player: string]: boolean;
  };
  leader: IPlayer['displayName'];
  team: IPlayer['displayName'][];
}

export interface IMission {
  fails?: number;
  proposals: IProposal[];
}

export interface IGame {
  players: IPlayer[];
  history: IMission[];
}

interface ISetGameAction {
  type: typeof SET_GAME;
  payload: IGame;
}

export type GameActionTypes = ISetGameAction;
