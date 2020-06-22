import { Machine, assign } from 'xstate';

export interface RoomPlayer {
  id: string;
  username: string;
  displayUsername: string;
  // socketId: string;
}

export interface RoomContext {
  players: RoomPlayer[];
  spectators: RoomPlayer[];
}

export interface RoomStateSchema {
  states: {
    waiting: {};
    inProgress: {};
    finished: {};
  };
}

export type RoomEvent =
  | { type: 'PLAYER_JOIN'; player: RoomPlayer }
  | { type: 'PLAYER_LEAVE'; player: RoomPlayer }
  | { type: 'PLAYER_SIT_DOWN'; player: RoomPlayer }
  | { type: 'PLAYER_STAND_UP'; player: RoomPlayer }
  | { type: 'START_GAME' }
  | { type: 'GAME_END' };

export const RoomMachine = Machine<RoomContext, RoomStateSchema, RoomEvent>({
  id: 'room',
  initial: 'waiting',
  context: { players: [], spectators: [] },
  states: {
    waiting: {
      on: {
        PLAYER_JOIN: {
          actions: assign<RoomContext, RoomEvent>({
            spectators: (context, event) => {
              if (
                event.type === 'PLAYER_JOIN' &&
                context.spectators.indexOf(event.player) === -1
              ) {
                context.spectators.push(event.player);
              }
              return context.spectators;
            },
          }),
        },
        PLAYER_LEAVE: {
          actions: assign<RoomContext, RoomEvent>((context, event) => {
            if (event.type === 'PLAYER_LEAVE') {
              // Remove from players and spectators
              let index = context.players.indexOf(event.player);
              context.players.splice(index, 1);

              index = context.spectators.indexOf(event.player);
              context.spectators.splice(index, 1);
            }
            return {
              ...context,
              players: context.players,
              spectators: context.spectators,
            };
          }),
        },
        PLAYER_SIT_DOWN: {
          actions: assign<RoomContext, RoomEvent>((context, event) => {
            if (event.type === 'PLAYER_SIT_DOWN') {
              // Add to players
              context.players.push(event.player);

              // Remove from spectator
              const index = context.spectators.indexOf(event.player);
              context.spectators.splice(index, 1);
            }
            return {
              ...context,
              players: context.players,
              spectators: context.spectators,
            };
          }),
        },
        PLAYER_STAND_UP: {
          actions: assign<RoomContext, RoomEvent>((context, event) => {
            if (event.type === 'PLAYER_STAND_UP') {
              // Remove from players
              let index = context.players.indexOf(event.player);
              context.players.splice(index, 1);

              // Add to spectator if doesn't exist there already
              index = context.spectators.indexOf(event.player);
              if (index === -1) {
                context.spectators.push(event.player);
              }
            }
            return {
              ...context,
              players: context.players,
              spectators: context.spectators,
            };
          }),
        },
        START_GAME: 'inProgress',
      },
    },
    inProgress: {
      on: {
        GAME_END: 'finished',
      },
    },
    finished: {
      type: 'final',
    },
  },
});
