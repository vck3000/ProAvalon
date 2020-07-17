import { Machine, assign } from 'xstate';

export interface Player {
  socketId: string;
  username: string;
  displayUsername: string;
}

type TeamVote = 'approve' | 'reject' | null;
type MissionVote = 'succeed' | 'fail' | null;

export interface PlayerContext {
  teamVote: TeamVote;
  missionVote: MissionVote;
  player: Player;
  spectator: boolean;
}

export interface PlayerStateSchema {
  states: {
    idle: {};
    special: {};
  };
}

export type PlayerEvents =
  | { type: 'TEAM_VOTE'; vote: TeamVote }
  | { type: 'MISSION_VOTE'; vote: MissionVote }
  | { type: 'SET_CONTEXT'; player: Player };

export const PlayerMachine = Machine<
  PlayerContext,
  PlayerStateSchema,
  PlayerEvents
>({
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
  },
  states: {
    idle: {
      on: {
        TEAM_VOTE: {
          actions: assign<PlayerContext, PlayerEvents>({
            teamVote: (_, e) => {
              if (e.type === 'TEAM_VOTE') {
                return e.vote;
              }
              return null;
            },
          }),
        },
        MISSION_VOTE: {
          actions: assign<PlayerContext, PlayerEvents>({
            missionVote: (_, e) => {
              if (e.type === 'MISSION_VOTE') {
                return e.vote;
              }
              return null;
            },
          }),
        },
        SET_CONTEXT: {
          actions: assign<PlayerContext, PlayerEvents>({
            player: (_, e) => (e as any).player,
          }),
        },
      },
    },
    special: {},
  },
});
