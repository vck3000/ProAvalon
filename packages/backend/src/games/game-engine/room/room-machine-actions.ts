import { assign } from 'xstate';
import { RoomContext, RoomEvents } from './room-machine';
import { Entity } from '../ecs/game-entity';
import { CPlayer } from '../ecs/game-components';
import { indexOfPlayer } from '../util';

export const initialSettings = assign<RoomContext, RoomEvents>((c, e) => {
  if (e.type === 'INITIAL_SETTINGS') {
    // Set in the ID and host if ID has not been set yet.
    // Change in two places: roomDataToUser and lobbyRoomDataToUser.
    if (c.roomDataToUser.id === -1) {
      return {
        ...c,
        roomDataToUser: { ...c.roomDataToUser, id: e.id, host: e.host },
        lobbyRoomDataToUser: {
          ...c.lobbyRoomDataToUser,
          id: e.id,
          host: e.host,
        },
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
