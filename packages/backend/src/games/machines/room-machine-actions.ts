import { assign, spawn, Interpreter, send } from 'xstate';
import { RoomContext, RoomEvents } from './room-machine';
import {
  PlayerMachine,
  PlayerContext,
  PlayerStateSchema,
  PlayerEvents,
} from './player-machine';

//! Do I need to stop the spawned machine services before deleting their reference?

/**
 * Finds the index of a player given a list of player services and lowercased username.
 * Returns -1 if username doesn't exist
 */
const indexOfPlayer = (
  playerServices: Interpreter<PlayerContext, PlayerStateSchema, PlayerEvents>[],
  username: string,
) => {
  for (const [i, player] of playerServices.entries()) {
    if (player.state.context.player.username === username) {
      return i;
    }
  }

  return -1;
};

export const PLAYER_JOIN_ACTION = assign<RoomContext, RoomEvents>({
  spectators: (context, event) => {
    if (
      event.type === 'PLAYER_JOIN' &&
      indexOfPlayer(context.spectators, event.player.username) === -1
    ) {
      return [...context.spectators, spawn(PlayerMachine, { sync: true })];
    }
    return [...context.spectators];
  },
});

export const PLAYER_SET_INITIAL_CONTEXT_ACTION = send<RoomContext, RoomEvents>(
  (_, e) => ({
    ...e,
    type: 'SET_CONTEXT',
  }),
  {
    to: (c, e) => {
      if (e.type === 'PLAYER_JOIN') {
        return c.spectators[c.spectators.length - 1].id;
      }
      return '';
    },
  },
);

export const PLAYER_LEAVE_ACTION = assign<RoomContext, RoomEvents>(
  (context, event) => {
    const players = [...context.players];
    const spectators = [...context.spectators];

    if (event.type === 'PLAYER_LEAVE') {
      // Remove from players and spectators
      let index = indexOfPlayer(players, event.player.username);
      players.splice(index, 1);

      index = indexOfPlayer(spectators, event.player.username);
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
      const index = indexOfPlayer(spectators, event.player.username);

      // Add to players
      players.push(spectators[index]);

      // Remove from spectator
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
      // Add to spectator if doesn't exist there already
      const index = indexOfPlayer(players, event.player.username);
      if (index !== -1) {
        spectators.push(players[index]);
      }

      // Remove from players
      players.splice(index, 1);
    }

    return {
      ...context,
      players,
      spectators,
    };
  },
);
