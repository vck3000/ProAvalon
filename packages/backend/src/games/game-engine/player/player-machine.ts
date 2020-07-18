import { Machine, assign, State } from 'xstate';
import { RoomContext, RoomEvents, Player } from '../room/room-machine';
import { GameSystem, SpecialEvent } from '../system/types';
import {
  setTeamVote,
  setMissionVote,
  setPlayer,
  setPlayerGameData,
  runPlayerSystems,
  playerSpecial,
} from './player-machine-actions';

type TeamVote = 'approve' | 'reject' | null;
type MissionVote = 'succeed' | 'fail' | null;

interface GamePlayerData {
  alliance: 'resistance' | 'spy' | null;
  role: string;
  systems: GameSystem[];
}

export interface PlayerContext {
  teamVote: TeamVote;
  missionVote: MissionVote;
  player: Player;
  spectator: boolean;
  gamePlayerData: GamePlayerData;
}

export interface PlayerStateSchema {
  states: {
    idle: {};
  };
}

export type PlayerEvents =
  | { type: 'TEAM_VOTE'; vote: TeamVote }
  | { type: 'MISSION_VOTE'; vote: MissionVote }
  | { type: 'SET_PLAYER'; player: Player }
  | { type: 'SET_PLAYER_GAME_DATA'; gamePlayerData: GamePlayerData }
  | { type: 'RUN_SYSTEMS'; gameState: State<RoomContext, RoomEvents> }
  | {
      type: 'SPECIAL';
      gameState: State<RoomContext, RoomEvents>;
      event: SpecialEvent;
    }
  | { type: 'test' };

export const PlayerMachine = Machine<
  PlayerContext,
  PlayerStateSchema,
  PlayerEvents
>(
  {
    id: 'player',
    initial: 'idle',
    context: {
      teamVote: null,
      missionVote: null,
      player: {
        socketId: '',
        username: '',
        displayUsername: '',
      },
      spectator: true,
      gamePlayerData: {
        alliance: null,
        role: '',
        systems: [],
      },
    },
    states: {
      idle: {
        on: {
          TEAM_VOTE: {
            actions: 'setTeamVote',
          },
          MISSION_VOTE: {
            actions: 'setMissionVote',
          },
          SET_PLAYER: {
            actions: 'setPlayer',
          },
          SET_PLAYER_GAME_DATA: {
            actions: 'setPlayerGameData',
          },
          RUN_SYSTEMS: {
            actions: 'runPlayerSystems',
          },
          SPECIAL: {
            actions: 'playerSpecial',
          },
          test: {
            actions: assign<PlayerContext, PlayerEvents>((c, _) => {
              // console.log(`hi ${c.player.socketId}`);
              // console.log(c.gamePlayerData);
              const spectator = false;
              return { ...c, spectator };
            }),
          },
        },
      },
    },
  },
  {
    actions: {
      setTeamVote,
      setMissionVote,
      setPlayer,
      setPlayerGameData,
      runPlayerSystems,
      playerSpecial,
    },
  },
);
