import { Machine } from 'xstate';
import {
  playerJoin,
  playerLeave,
  playerSitDown,
  playerStandUp,
  startGame,
  runSystems,
  setGameState,
  addSystem,
  handleSpecialEvent,
} from './room-machine-actions';

import { Entity } from '../ecs/game-entity';

import { isLeaderCond, minPlayers } from './room-machine-guards';

export interface PlayerInfo {
  socketId: string;
  displayUsername: string;
}

interface GameData {
  leader: number;
}

export interface RoomContext {
  entities: Entity[];
  entityCount: number;
  systems: string[];
  game: GameData;
  gameState: string;
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
  | { type: 'PLAYER_JOIN'; player: PlayerInfo }
  | { type: 'PLAYER_LEAVE'; player: PlayerInfo }
  | { type: 'PLAYER_SIT_DOWN'; player: PlayerInfo }
  | { type: 'PLAYER_STAND_UP'; player: PlayerInfo }
  | { type: 'START_GAME'; player: PlayerInfo }
  | { type: 'GAME_END' };

type GameEvents =
  | { type: 'PICK'; player: PlayerInfo }
  | { type: 'VOTE_TEAM'; player: PlayerInfo }
  | { type: 'VOTE_MISSION'; player: PlayerInfo };

type EntityEvents =
  | { type: 'SPECIAL_STATE_ENTER' }
  | { type: 'SPECIAL_STATE_LEAVE' }
  | { type: 'SPECIAL'; specialType: string; data: any; player: PlayerInfo }
  | { type: 'ADD_SYSTEM'; systemName: string };

export type RoomEvents = BaseEvents | GameEvents | EntityEvents;

export const RoomMachine = Machine<RoomContext, RoomStateSchema, RoomEvents>(
  {
    id: 'room',
    initial: 'waiting',
    context: {
      entities: [],
      entityCount: 0,
      systems: [],
      game: { leader: 0 },
      gameState: 'waiting',
    },
    states: {
      waiting: {
        on: {
          PLAYER_JOIN: {
            actions: 'playerJoin',
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
                entry: {
                  type: 'setGameState',
                  gameState: 'pick',
                },
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
                entry: [
                  { type: 'setGameState', gameState: 'voteTeam' },
                  'runSystems',
                ],
                on: {
                  VOTE_TEAM: {
                    target: 'pick',
                    internal: false,
                    in: '#room.game.special.idle',
                  },
                },
              },
              voteMission: {
                entry: {
                  type: 'setGameState',
                  gameState: 'voteMission',
                },
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
                    actions: ['handleSpecialEvent', 'runSystems'],
                  },
                },
              },
            },
          },
        },
        on: {
          // TODO Move this somewhere else later
          ADD_SYSTEM: {
            actions: 'addSystem',
          },
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
      playerLeave,
      playerSitDown,
      playerStandUp,
      startGame,
      runSystems,
      setGameState,
      addSystem,
      handleSpecialEvent,
    },
    guards: {
      isLeaderCond,
      minPlayers,
    },
  },
);
