import { assign, spawn, actions } from 'xstate';
import { RoomContext, RoomEvents } from './room-machine';
import { PlayerMachine } from '../player/player-machine';

import { assassinSystem } from '../system/assassin';

import { indexOfPlayer } from '../util';

const { pure } = actions;

//! Do I need to stop the spawned machine services before deleting their reference?

export const playerJoin = assign<RoomContext, RoomEvents>({
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

export const playerSetInitialContext = pure((c: RoomContext, e: RoomEvents) => {
  // Send to the last player
  c.spectators[c.spectators.length - 1].send('SET_PLAYER', {
    player: (e as any).player,
  });
  return undefined;
});

export const playerLeave = assign<RoomContext, RoomEvents>((context, event) => {
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
});

export const playerSitDown = assign<RoomContext, RoomEvents>(
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

export const playerStandUp = assign<RoomContext, RoomEvents>(
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

const NUM_SPIES: Record<number, number> = {
  5: 2,
  6: 2,
  7: 3,
  8: 3,
  9: 4,
  10: 4,
};

export const startGame = assign<RoomContext, RoomEvents>((c, _) => {
  // test
  const numPlayers = c.players.length;
  const leader = Math.floor(Math.random() * numPlayers);

  let count = 0;

  // Set in resistance
  for (let i = 0; i < c.players.length - NUM_SPIES[c.players.length]; i += 1) {
    c.players[count].send('SET_PLAYER_GAME_DATA', {
      gamePlayerData: {
        alliance: 'resistance',
        role: 'resistance-role',
        systems: [],
      },
    });

    count += 1;
  }

  // Set in spies
  for (let i = 0; i < NUM_SPIES[c.players.length]; i += 1) {
    c.players[count].send('SET_PLAYER_GAME_DATA', {
      gamePlayerData: {
        alliance: 'spy',
        role: 'spy-role',
        systems: [],
      },
    });

    count += 1;
  }

  // console.log(c);
  // console.log(actionMeta.state!.value);

  // Give the last spy a special assassin role
  c.players[c.players.length - 1].send('SET_PLAYER_GAME_DATA', {
    gamePlayerData: {
      alliance: 'spy',
      role: 'assassin',
      systems: [assassinSystem],
    },
  });

  for (const player of c.players) {
    player.send('test');
  }

  return {
    ...c,
    game: {
      leader,
    },
  };
});

export const runSystems = assign<RoomContext, RoomEvents>(
  (c, _, actionMeta) => {
    for (const player of c.players) {
      player.send('RUN_SYSTEMS', { gameState: actionMeta.state });
    }
    return { ...c };
  },
);

export const forwardSpecial = assign<RoomContext, RoomEvents>(
  (c, e, actionMeta) => {
    // TODO: Fix this up to not be naive later.
    //  Do a naive solution and forward the event to each player's sytems
    if (e.type === 'SPECIAL') {
      for (const player of c.players) {
        player.send('SPECIAL', {
          gameState: actionMeta.state,
          event: {
            type: e.specialType,
            data: e.data,
          },
        });
      }
    }
    return { ...c };
  },
);
