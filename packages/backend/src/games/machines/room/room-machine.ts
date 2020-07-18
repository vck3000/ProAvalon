import { Machine, Interpreter } from 'xstate';
import {
  playerJoin,
  playerLeave,
  playerSitDown,
  playerStandUp,
  playerSetInitialContext,
  startGame,
  runSystems,
  forwardSpecial,
} from './room-machine-actions';
import {
  Player,
  PlayerContext,
  PlayerStateSchema,
  PlayerEvents,
} from '../player/player-machine';

import { isLeaderCond, minPlayers } from './room-machine-guards';

interface RoomSettings {
  entities: [];
}

interface GameData {
  leader: number;
}

export interface RoomContext {
  players: Interpreter<PlayerContext, PlayerStateSchema, PlayerEvents>[];
  spectators: Interpreter<PlayerContext, PlayerStateSchema, PlayerEvents>[];
  settings: RoomSettings;
  game: GameData;
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
  | { type: 'START_GAME'; player: Player }
  | { type: 'GAME_END' };

type GameEvents =
  | { type: 'PICK'; player: Player }
  | { type: 'VOTE_TEAM'; player: Player }
  | { type: 'VOTE_MISSION'; player: Player };

type EntityEvents =
  | { type: 'SPECIAL_STATE_ENTER' }
  | { type: 'SPECIAL_STATE_LEAVE' }
  | { type: 'SPECIAL'; specialType: string; data: any };

export type RoomEvents = BaseEvents | GameEvents | EntityEvents;

export const RoomMachine = Machine<RoomContext, RoomStateSchema, RoomEvents>(
  {
    id: 'room',
    initial: 'waiting',
    context: {
      players: [],
      spectators: [],
      settings: { entities: [] },
      game: { leader: 0 },
    },
    states: {
      waiting: {
        on: {
          PLAYER_JOIN: {
            actions: ['playerJoin', 'playerSetInitialContext'],
          },
          PLAYER_LEAVE: {
            actions: 'playerLeave',
          },
          PLAYER_SIT_DOWN: {
            actions: 'playerSitDown',
          },
          PLAYER_STAND_UP: {
            actions: 'playerStandUp',
          },
          START_GAME: {
            target: 'game',
            actions: 'startGame',
            cond: 'minPlayers',
          },
        },
      },
      game: {
        id: 'game',
        type: 'parallel',
        states: {
          standard: {
            initial: 'pick',
            id: 'standard',
            states: {
              pick: {
                // entry: 'runSystems',
                on: {
                  PICK: {
                    // External transitions so that runSystems is triggered!
                    target: 'voteTeam',
                    internal: false,
                    cond: 'isLeaderCond',
                    in: '#room.game.special.idle',
                  },
                },
              },
              voteTeam: {
                entry: 'runSystems',
                on: {
                  VOTE_TEAM: {
                    target: 'pick',
                    internal: false,
                    in: '#room.game.special.idle',
                  },
                },
              },
              voteMission: {
                // entry: 'runSystems',
                on: {
                  VOTE_MISSION: {
                    target: 'pick',
                    internal: false,
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
                  SPECIAL: {
                    actions: 'forwardSpecial',
                  },
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
  },
  {
    actions: {
      playerJoin,
      playerSetInitialContext,
      playerLeave,
      playerSitDown,
      playerStandUp,
      startGame,
      runSystems,
      forwardSpecial,
    },
    guards: {
      isLeaderCond,
      minPlayers,
    },
  },
);
