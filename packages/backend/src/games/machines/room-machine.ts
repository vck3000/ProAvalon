import { Machine, Interpreter } from 'xstate';
import {
  PLAYER_JOIN_ACTION,
  PLAYER_LEAVE_ACTION,
  PLAYER_SIT_DOWN_ACTION,
  PLAYER_STAND_UP_ACTION,
  PLAYER_SET_INITIAL_CONTEXT_ACTION,
} from './room-machine-actions';

import {
  Player,
  PlayerContext,
  PlayerStateSchema,
  PlayerEvents,
} from './player-machine';

export interface RoomContext {
  // players: Player[];
  // spectators: Player[];
  players: Interpreter<PlayerContext, PlayerStateSchema, PlayerEvents>[];
  spectators: Interpreter<PlayerContext, PlayerStateSchema, PlayerEvents>[];
}

export interface RoomStateSchema {
  states: {
    waiting: {};
    game: {
      states: {
        standard: {
          states: {
            pick: {};
            voteTeam: {};
            voteMission: {};
          };
        };
        special: {
          states: {
            idle: {};
            active: {};
          };
        };
      };
    };
    finished: {};
  };
}

type BaseEvents =
  | { type: 'PLAYER_JOIN'; player: Player }
  | { type: 'PLAYER_LEAVE'; player: Player }
  | { type: 'PLAYER_SIT_DOWN'; player: Player }
  | { type: 'PLAYER_STAND_UP'; player: Player }
  | { type: 'START_GAME' }
  | { type: 'GAME_END' };

type GameEvents =
  | { type: 'PICK' }
  | { type: 'VOTE_TEAM' }
  | { type: 'VOTE_MISSION' };

type EntityEvents =
  | { type: 'SPECIAL_STATE_ENTER' }
  | { type: 'SPECIAL_STATE_LEAVE' };

export type RoomEvents = BaseEvents | GameEvents | EntityEvents;

export const RoomMachine = Machine<RoomContext, RoomStateSchema, RoomEvents>({
  id: 'room',
  initial: 'waiting',
  context: { players: [], spectators: [] },
  states: {
    waiting: {
      on: {
        PLAYER_JOIN: {
          actions: [PLAYER_JOIN_ACTION, PLAYER_SET_INITIAL_CONTEXT_ACTION],
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
      id: 'game',
      type: 'parallel',
      states: {
        standard: {
          initial: 'pick',
          states: {
            pick: {
              on: {
                PICK: {
                  target: 'voteTeam',
                  in: '#room.game.special.idle',
                },
              },
            },
            voteTeam: {
              on: {
                VOTE_TEAM: {
                  target: 'pick',
                  in: '#room.game.special.idle',
                },
              },
            },
            voteMission: {
              on: {
                VOTE_MISSION: {
                  target: 'pick',
                  in: '#room.game.special.idle',
                },
              },
            },
          },
        },
        special: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                SPECIAL_STATE_ENTER: 'active',
              },
            },
            active: {
              on: {
                SPECIAL_STATE_LEAVE: 'idle',
              },
            },
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
