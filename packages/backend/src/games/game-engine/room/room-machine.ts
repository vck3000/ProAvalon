import { Machine } from 'xstate';
import {
  PickData,
  VoteTeamData,
  GameState,
  MissionOutcome,
} from '@proavalon/proto/game';
import { RoomData, RoomState, GameMode } from '@proavalon/proto/room';
import { LobbyRoomData } from '@proavalon/proto/lobby';
import {
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

interface GameData {
  leader: number;
  team: string[];
}

export interface RoomContext {
  entities: Entity[];
  entityCount: number;
  systems: string[];
  game: GameData;
  gameState: string;
  roomDataToUser: RoomData;
  lobbyRoomDataToUser: LobbyRoomData;
}

export interface RoomStateSchema {
  states: {
    [RoomState.waiting]: {};
    game: {
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
      game: { leader: 0, team: [] },
      gameState: 'waiting',
      roomDataToUser: {
        id: -1,
        state: RoomState.waiting,
        roles: ['merlin', 'assassin'],
        host: 'undefined',
        mode: GameMode.AVALON,
        kickedPlayers: [],
        playerEntities: [],
      },
      lobbyRoomDataToUser: {
        mode: GameMode.AVALON,
        id: -1,
        host: 'undefined',
        avatarLinks: [
          'http://cdn.discordapp.com/attachments/430166478193688597/481009331622510602/pronub-res.png',
          'http://cdn.discordapp.com/attachments/430166478193688597/481009331622510602/pronub-res.png',
          '/game_room/base-res.png',
          '/game_room/base-res.png',
          '/game_room/base-res.png',
          '/game_room/base-res.png',
          '/game_room/base-res.png',
        ],
        numSpectators: 1234,
        missionOutcome: [MissionOutcome.fail, MissionOutcome.success],
      },
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
