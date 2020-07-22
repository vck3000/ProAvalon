import { assign } from 'xstate';
import { RoomSocketEvents } from '@proavalon/proto/room';
import { RoomContext, RoomEvents } from './room-machine';
import { Entity } from '../ecs/game-entity';
import { CPlayer } from '../ecs/game-components';
import { indexOfPlayer } from '../util';

export const initialSettings = assign<RoomContext, RoomEvents>((c, e) => {
  if (e.type === 'INITIAL_SETTINGS') {
    // Set in the ID and host if ID has not been set yet.
    // Change in two places: roomDataToUser and lobbyRoomDataToUser.
    if (c.roomData.id === -1) {
      return {
        ...c,
        roomData: { ...c.roomData, id: e.id, host: e.host },
      };
    }
  }
  return { ...c };
});

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
  const entities = [...c.entities];
  let { entityCount } = c;

  if (e.type === RoomSocketEvents.JOIN_ROOM) {
    const index = indexOfPlayer(entities, e.player.displayUsername);

    if (index === -1) {
      const newPlayer = new Entity(entityCount);
      newPlayer.addComponent(new CPlayer(e.player));

      entityCount += 1;

      entities.push(newPlayer);

      return {
        ...c,
        entities,
        entityCount,
      };
    }
  }
  return { ...c };
});

export const playerLeave = assign<RoomContext, RoomEvents>((c, e) => {
  const entities = [...c.entities];

  if (e.type === RoomSocketEvents.LEAVE_ROOM) {
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
  const entities = [...c.entities];

  if (e.type === RoomSocketEvents.SIT_DOWN) {
    const index = indexOfPlayer(entities, e.player.displayUsername);
    if (index !== -1) {
      (entities[index].components[CPlayer.name] as CPlayer).satDown = true;
    }
  }

  return {
    ...c,
    entities,
  };
});

export const playerStandUp = assign<RoomContext, RoomEvents>((c, e) => {
  const entities = [...c.entities];

  if (e.type === RoomSocketEvents.STAND_UP) {
    const index = indexOfPlayer(entities, e.player.displayUsername);
    (entities[index].components[CPlayer.name] as CPlayer).satDown = false;
  }

  return {
    ...c,
    entities,
  };
});
