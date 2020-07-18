import { assign } from 'xstate';
import { RoomContext, RoomEvents } from './room-machine';

import { Entity } from '../ecs/game-entity';

import { indexOfPlayer } from '../util';
import { CPlayer } from '../ecs/game-components';

//! Do I need to stop the spawned machine services before deleting their reference?

export const playerJoin = assign<RoomContext, RoomEvents>((c, e) => {
  if (e.type === 'PLAYER_JOIN') {
    const newPlayer = new Entity(c.entityCount);
    newPlayer.addComponent(new CPlayer(e.player));
    return { ...c, entities: [...c.entities, newPlayer] };
  }
  return { ...c };
});

export const playerLeave = assign<RoomContext, RoomEvents>((c, e) => {
  const { entities } = c;

  if (e.type === 'PLAYER_LEAVE') {
    // Remove from players and spectators
    const index = indexOfPlayer(entities, e.player.displayUsername);
    entities.splice(index, 1);
  }
  return {
    ...c,
    entities,
  };
});

export const playerSitDown = assign<RoomContext, RoomEvents>((c, e) => {
  const { entities } = c;

  if (e.type === 'PLAYER_SIT_DOWN') {
    const index = indexOfPlayer(entities, e.player.displayUsername);
    (entities[index].components[CPlayer.name] as CPlayer).satDown = true;
  }

  return {
    ...c,
    entities,
  };
});

export const playerStandUp = assign<RoomContext, RoomEvents>((c, e) => {
  const { entities } = c;

  if (e.type === 'PLAYER_STAND_UP') {
    const index = indexOfPlayer(entities, e.player.displayUsername);
    (entities[index].components[CPlayer.name] as CPlayer).satDown = false;
  }

  return {
    ...c,
    entities,
  };
});

// const NUM_SPIES: Record<number, number> = {
//   5: 2,
//   6: 2,
//   7: 3,
//   8: 3,
//   9: 4,
//   10: 4,
// };

// export const startGame = assign<RoomContext, RoomEvents>((c, _) => {
//   // test
//   const numPlayers = c.players.length;
//   const leader = Math.floor(Math.random() * numPlayers);
//
//   let count = 0;
//
//   // Set in resistance
//   for (let i = 0; i < c.players.length - NUM_SPIES[c.players.length]; i += 1) {
//     c.players[count].send('SET_PLAYER_GAME_DATA', {
//       gamePlayerData: {
//         alliance: 'resistance',
//         role: 'resistance-role',
//         systems: [],
//       },
//     });
//
//     count += 1;
//   }
//
//   // Set in spies
//   for (let i = 0; i < NUM_SPIES[c.players.length]; i += 1) {
//     c.players[count].send('SET_PLAYER_GAME_DATA', {
//       gamePlayerData: {
//         alliance: 'spy',
//         role: 'spy-role',
//         systems: [],
//       },
//     });
//
//     count += 1;
//   }
//
//   // console.log(c);
//   // console.log(actionMeta.state!.value);
//
//   // Give the last spy a special assassin role
//   c.players[c.players.length - 1].send('SET_PLAYER_GAME_DATA', {
//     gamePlayerData: {
//       alliance: 'spy',
//       role: 'assassin',
//       systems: [assassinSystem],
//     },
//   });
//
//   for (const player of c.players) {
//     player.send('test');
//   }
//
//   return {
//     ...c,
//     game: {
//       leader,
//     },
//   };
// });
//
// export const runSystems = assign<RoomContext, RoomEvents>(
//   (c, _, actionMeta) => {
//     for (const player of c.players) {
//       player.send('RUN_SYSTEMS', { gameState: actionMeta.state });
//     }
//     return { ...c };
//   },
// );
//
// export const forwardSpecial = assign<RoomContext, RoomEvents>(
//   (c, e, actionMeta) => {
//     // TODO: Fix this up to not be naive later.
//     //  Do a naive solution and forward the event to each player's sytems
//     if (e.type === 'SPECIAL') {
//       for (const player of c.players) {
//         player.send('SPECIAL', {
//           gameState: actionMeta.state,
//           event: {
//             type: e.specialType,
//             data: e.data,
//           },
//         });
//       }
//     }
//     return { ...c };
//   },
// );
