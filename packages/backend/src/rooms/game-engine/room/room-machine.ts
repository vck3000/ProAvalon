import { Machine } from 'xstate';
import { GameState } from '@proavalon/proto/game';
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
  voteMissionEvent,
  voteMissionFinish,
  finishGameEntry,
} from './room-machine-game-actions';

import {
  pickTeamGuard,
  minPlayers,
  voteTeamHammerRejected,
  voteTeamRejected,
  voteTeamApproved,
  missionsFinished,
  allMissionVotesIn,
} from './room-machine-guards';

import {
  RoomContext,
  RoomStateSchema,
  RoomEvents,
} from './rooms-machine-types';

export const NUM_PLAYERS_ON_MISSION: Record<number, string[]> = {
  5: ['2', '3', '2', '3', '3'],
  6: ['2', '3', '4', '3', '4'],
  7: ['2', '3', '3', '4*', '4'],
  8: ['3', '4', '4', '5*', '5'],
  9: ['3', '4', '4', '5*', '5'],
  10: ['3', '4', '4', '5*', '5'],
};

export const RoomMachine = Machine<RoomContext, RoomStateSchema, RoomEvents>(
  {
    id: 'room',
    initial: RoomState.waiting,
    context: {
      entities: [],
      entityCount: 0,
      systems: [],
      gameData: {
        leader: 0,
        team: [],
        gameSize: 0,
        gameHistory: {
          missionOutcome: [],
          missionHistory: [],
        },
      },
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
                always: [
                  {
                    target: 'finished',
                    cond: 'missionsFinished',
                  },
                ],
                on: {
                  PICK: {
                    // External transitions so that runSystems is triggered!
                    target: 'voteTeam',
                    actions: 'pickEvent',
                    internal: false,
                    cond: 'pickTeamGuard',
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
                always: [
                  {
                    target: 'pick',
                    cond: 'allMissionVotesIn',
                    actions: 'voteMissionFinish',
                  },
                ],
                on: {
                  VOTE_MISSION: {
                    target: GameState.voteMission,
                    actions: 'voteMissionEvent',
                    internal: false,
                    in: '#room.game.special.idle',
                  },
                },
              },
              finished: {
                entry: [
                  {
                    type: 'setGameState',
                    gameState: 'standard.finished',
                  },
                  'runSystems',
                ],
                on: {
                  // runSystems will send this event when there is no system action
                  gameFinishDone: '#finished',
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
        entry: [
          { type: 'setGameState', gameState: 'finished' },
          'finishGameEntry',
        ],
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
      voteMissionEvent,
      voteMissionFinish,
      finishGameEntry,
    },
    guards: {
      pickTeamGuard,
      minPlayers,
      voteTeamHammerRejected,
      voteTeamRejected,
      voteTeamApproved,
      missionsFinished,
      allMissionVotesIn,
    },
  },
);
