import { Machine } from 'xstate';
import { PickData, VoteTeamData, GameState } from '@proavalon/proto/game';
import { RoomState, GameMode, RoomSocketEvents } from '@proavalon/proto/room';
import {
  initialSettings,
  playerJoin,
  playerLeave,
  playerSitDown,
  playerStandUp,
  setGameState,
} from './room-machine-actions';

import {
  startGame,
  runSystems,
  addSystem,
  handleSpecialEvent,
  pickEvent,
  voteTeamEvent,
  voteTeamFinish,
} from './room-machine-game-actions';

import { Entity } from '../ecs/game-entity';

import {
  isLeaderCond,
  minPlayers,
  voteTeamHammerRejected,
  voteTeamRejected,
  voteTeamApproved,
} from './room-machine-guards';

export interface PlayerInfo {
  socketId: string;
  displayUsername: string;
}

interface MachineGameData {
  leader: number;
  team: string[];
}

export declare class MachineRoomData {
  id: number;
  host: string;
  mode: GameMode;
  roles: string[];
  kickedPlayers: string[];
  gameBarMsg: string;
}

export interface RoomContext {
  entities: Entity[];
  entityCount: number;
  systems: string[];
  gameData: MachineGameData;
  roomData: MachineRoomData;
  // TODO make this a literal type
  gameState: string;
}

export interface RoomStateSchema {
  states: {
    [RoomState.waiting]: {};
    [RoomState.game]: {
      states: {
        standard: {
          states: {
            [GameState.pick]: {};
            [GameState.voteTeam]: {};
            [GameState.voteMission]: {};
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
    [RoomState.finished]: {};
  };
}

type BaseEvents =
  | { type: 'INITIAL_SETTINGS'; id: number; host: string }
  | { type: RoomSocketEvents.JOIN_ROOM; player: PlayerInfo }
  | { type: RoomSocketEvents.LEAVE_ROOM; player: PlayerInfo }
  | { type: RoomSocketEvents.SIT_DOWN; player: PlayerInfo }
  | { type: RoomSocketEvents.STAND_UP; player: PlayerInfo }
  | { type: 'START_GAME'; player: PlayerInfo }
  | { type: 'GAME_END' };

type GameEvents =
  | { type: 'PICK'; player: PlayerInfo; data: PickData }
  | { type: 'VOTE_TEAM'; player: PlayerInfo; data: VoteTeamData }
  | { type: 'VOTE_TEAM_APPROVED' }
  | { type: 'VOTE_TEAM_REJECTED' }
  | { type: 'VOTE_TEAM_HAMMER_REJECTED' }
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
    initial: RoomState.waiting,
    context: {
      entities: [],
      entityCount: 0,
      systems: [],
      gameData: { leader: 0, team: [] },
      gameState: 'waiting',
      roomData: {
        id: -1,
        roles: ['merlin', 'assassin'],
        host: 'undefined',
        mode: GameMode.AVALON,
        kickedPlayers: [],
        gameBarMsg: 'Avalon: Assassin, Merlin',
      },
    },
    on: {
      INITIAL_SETTINGS: {
        actions: 'initialSettings',
      },
    },
    states: {
      waiting: {
        on: {
          [RoomSocketEvents.JOIN_ROOM]: {
            actions: 'playerJoin',
          },
          [RoomSocketEvents.LEAVE_ROOM]: {
            actions: 'playerLeave',
          },
          [RoomSocketEvents.SIT_DOWN]: {
            actions: 'playerSitDown',
          },
          [RoomSocketEvents.STAND_UP]: {
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
            initial: GameState.pick,
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
                    actions: 'pickEvent',
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
                always: [
                  {
                    target: '#finished',
                    cond: 'voteTeamHammerRejected',
                    actions: 'voteTeamFinish',
                  },
                  {
                    target: 'pick',
                    cond: 'voteTeamRejected',
                    actions: 'voteTeamFinish',
                  },
                  {
                    target: 'voteMission',
                    cond: 'voteTeamApproved',
                    actions: 'voteTeamFinish',
                  },
                ],
                on: {
                  VOTE_TEAM: {
                    target: 'voteTeam',
                    actions: 'voteTeamEvent',
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
        },
      },
      finished: {
        id: 'finished',
        type: 'final',
      },
    },
  },
  {
    actions: {
      initialSettings,
      playerJoin,
      playerLeave,
      playerSitDown,
      playerStandUp,
      startGame,
      runSystems,
      setGameState,
      addSystem,
      handleSpecialEvent,
      pickEvent,
      voteTeamEvent,
      voteTeamFinish,
    },
    guards: {
      isLeaderCond,
      minPlayers,
      voteTeamHammerRejected,
      voteTeamRejected,
      voteTeamApproved,
    },
  },
);
