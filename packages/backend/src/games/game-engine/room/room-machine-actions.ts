import { assign, actions } from 'xstate';
import { RoomContext, RoomEvents } from './room-machine';
import { Entity } from '../ecs/game-entity';
import { CPlayer } from '../ecs/game-components';
import { addRoles } from '../ecs/game-assemblages';
import { indexOfPlayer, filterByComponent } from '../util';
import { allSystems } from '../ecs/game-systems';

const { pure } = actions;

// For use in the state machine
export const setGameState = assign<RoomContext, RoomEvents>((c, _, meta) => ({
  ...c,
  gameState: meta.action.gameState,
}));

// For use in xstate.actions.pure() functions
export const setGameStateFactory = (gameState: string) =>
  assign<RoomContext, RoomEvents>(() => ({
    gameState,
  }));

export const playerJoin = assign<RoomContext, RoomEvents>((c, e) => {
  if (e.type === 'PLAYER_JOIN') {
    const index = indexOfPlayer(c.entities, e.player.displayUsername);
    if (index === -1) {
      const newPlayer = new Entity(c.entityCount);
      newPlayer.addComponent(new CPlayer(e.player));
      return { ...c, entities: [...c.entities, newPlayer] };
    }
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
  const players = filterByComponent(c.entities, CPlayer.name);
  const numPlayers = players.length;
  const leader = Math.floor(Math.random() * numPlayers);

  let count = 0;

  // Set in resistance
  for (let i = 0; i < players.length - NUM_SPIES[players.length]; i += 1) {
    addRoles.Resistance(players[count]);
    count += 1;
  }

  // Set in spies
  for (let i = 0; i < NUM_SPIES[players.length]; i += 1) {
    addRoles.Spy(players[count]);
    count += 1;
  }

  // Give the last spy a special assassin role
  addRoles.Assassin(players[players.length - 1]);

  return {
    ...c,
    game: {
      leader,
    },
    systems: [], // ['SAssassin'],
  };
});

// TODO
export const runSystems = pure((c: RoomContext, e: RoomEvents) => {
  let actionsToExecute: any[] = [];
  const { systems } = c;

  // console.log('test');
  // console.log(c);
  // console.log(allSystems);

  for (const system of systems) {
    // console.log(`System: ${system}`);
    const res = allSystems[system].update(c, e);

    if (res) {
      actionsToExecute = actionsToExecute.concat(res);

      // Only allow one system to take action
      break;
    }
  }

  return actionsToExecute;
});

export const addSystem = assign<RoomContext, RoomEvents>((c, e) => {
  if (e.type === 'ADD_SYSTEM') {
    return {
      ...c,
      systems: [...c.systems, e.systemName],
    };
  }

  return {
    ...c,
  };
});

export const handleSpecialEvent = pure((c: RoomContext, e: RoomEvents) => {
  let actionsToExecute: any[] = [];
  const { systems } = c;

  for (const system of systems) {
    const res = allSystems[system].handleEvent(c, e);

    if (res) {
      actionsToExecute = actionsToExecute.concat(res);

      // Only allow one system to take action
      break;
    }
  }

  return actionsToExecute;
});
