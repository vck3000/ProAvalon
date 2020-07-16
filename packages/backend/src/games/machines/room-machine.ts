import { Machine } from 'xstate';
import {
  PLAYER_JOIN_ACTION,
  PLAYER_LEAVE_ACTION,
  PLAYER_SIT_DOWN_ACTION,
  PLAYER_STAND_UP_ACTION,
} from './room-machine-actions';

export interface RoomPlayer {
  socketId: string;
  username: string;
  displayUsername: string;
}

export interface RoomContext {
  players: RoomPlayer[];
  spectators: RoomPlayer[];
}

export interface RoomStateSchema {
  states: {
    waiting: {};
    game: {
      states: {
        pick: {};
        vote: {};
      };
    };
    finished: {};
  };
}

type BaseEvents =
  | { type: 'PLAYER_JOIN'; player: RoomPlayer }
  | { type: 'PLAYER_LEAVE'; player: RoomPlayer }
  | { type: 'PLAYER_SIT_DOWN'; player: RoomPlayer }
  | { type: 'PLAYER_STAND_UP'; player: RoomPlayer }
  | { type: 'START_GAME' }
  | { type: 'GAME_END' };

type GameEvents = { type: 'PICK' } | { type: 'VOTE' };

export type RoomEvents = BaseEvents | GameEvents;

export const RoomMachine = Machine<RoomContext, RoomStateSchema, RoomEvents>({
  id: 'room',
  initial: 'waiting',
  context: { players: [], spectators: [] },
  states: {
    waiting: {
      on: {
        PLAYER_JOIN: {
          actions: PLAYER_JOIN_ACTION,
        },
        PLAYER_LEAVE: {
          actions: PLAYER_LEAVE_ACTION,
        },
        PLAYER_SIT_DOWN: {
          actions: PLAYER_SIT_DOWN_ACTION,
        },
        PLAYER_STAND_UP: {
          actions: PLAYER_STAND_UP_ACTION,
        },
        START_GAME: {
          target: 'game',
          cond: (c, _) => c.players.length >= 5,
        },
      },
    },
    game: {
      initial: 'pick',
      states: {
        pick: {
          on: {
            PICK: 'vote',
          },
        },
        vote: {
          on: {
            VOTE: 'pick',
          },
        },
      },
      on: {
        GAME_END: 'finished',
      },
    },
    finished: {
      type: 'final',
    },
  },
});
