import { assign } from 'xstate';
import { RoomContext, RoomEvents } from './room-machine';

export const PLAYER_JOIN_ACTION = assign<RoomContext, RoomEvents>({
  spectators: (context, event) => {
    if (
      event.type === 'PLAYER_JOIN' &&
      context.spectators.indexOf(event.player) === -1
    ) {
      return [...context.spectators, event.player];
    }
    return [...context.spectators];
  },
});

export const PLAYER_LEAVE_ACTION = assign<RoomContext, RoomEvents>(
  (context, event) => {
    const players = [...context.players];
    const spectators = [...context.spectators];

    if (event.type === 'PLAYER_LEAVE') {
      // Remove from players and spectators
      let index = context.players.indexOf(event.player);
      players.splice(index, 1);

      index = context.spectators.indexOf(event.player);
      spectators.splice(index, 1);
    }
    return {
      ...context,
      players,
      spectators,
    };
  },
);

export const PLAYER_SIT_DOWN_ACTION = assign<RoomContext, RoomEvents>(
  (context, event) => {
    const spectators = [...context.spectators];
    const players = [...context.players];

    if (event.type === 'PLAYER_SIT_DOWN') {
      // Add to players
      players.push(event.player);

      // Remove from spectator
      const index = context.spectators.indexOf(event.player);
      spectators.splice(index, 1);
    }

    return {
      ...context,
      players,
      spectators,
    };
  },
);

export const PLAYER_STAND_UP_ACTION = assign<RoomContext, RoomEvents>(
  (context, event) => {
    const players = [...context.players];
    const spectators = [...context.spectators];

    if (event.type === 'PLAYER_STAND_UP') {
      // Remove from players
      let index = context.players.indexOf(event.player);
      if (index !== -1) {
        players.splice(index, 1);
      }

      // Add to spectator if doesn't exist there already
      index = context.spectators.indexOf(event.player);
      if (index === -1) {
        spectators.push(event.player);
      }
    }

    return {
      ...context,
      players,
      spectators,
    };
  },
);
