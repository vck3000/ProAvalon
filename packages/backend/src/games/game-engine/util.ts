import { Entity } from './ecs/game-entity';
import { CPlayer } from './ecs/game-components';

/**
 * Finds the index of a player given a list of player services and lowercased username.
 * Returns -1 if username doesn't exist
 */
export const indexOfPlayer = (entities: Entity[], username: string) => {
  for (const [i, entity] of entities.entries()) {
    if (entity.components[CPlayer.name]) {
      // This entity is a player
      if (
        (entity.components[
          CPlayer.name
        ] as CPlayer).displayUsername.toLowerCase() === username.toLowerCase()
      ) {
        return i;
      }
    }
  }

  return -1;
};

export const filterPlayers = (entities: Entity[]) => {
  const players: Entity[] = [];

  for (const e of entities) {
    console.log(e.components.player);
    console.log(e.components[CPlayer.name]);

    if (e.components[CPlayer.name]) {
      players.push(e);
    }
  }

  return players;
};
