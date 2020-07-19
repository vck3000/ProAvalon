import { assign } from 'xstate';
import { RoomContext, RoomEvents } from './room-machine';
import { Entity } from '../ecs/game-entity';
import { CPlayer } from '../ecs/game-components';
import { indexOfPlayer } from '../util';

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
