import { Interpreter } from 'xstate';
import {
  PlayerContext,
  PlayerStateSchema,
  PlayerEvents,
} from './player/player-machine';

/**
 * Finds the index of a player given a list of player services and lowercased username.
 * Returns -1 if username doesn't exist
 */
export const indexOfPlayer = (
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
