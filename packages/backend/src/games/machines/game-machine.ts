import { Machine } from 'xstate';

export interface GameContext {}

export interface GameStateSchema {
  states: {
    picking: {};
    votingTeam: {};
    votingMission: {};
    finished: {};
  };
}

export type GameEvent = { type: 'asdf' };

export const GameMachine = Machine<GameContext, GameStateSchema, GameEvent>({});
