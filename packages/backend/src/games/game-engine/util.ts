import { Entity } from './ecs/game-entity';
import { CPlayer } from './ecs/game-components';

export const filterByComponent = (entities: Entity[], name: string) =>
  entities.filter((e) => e.components[name]);

export const getComponent = (e: Entity, name: string) => e.components[name];

/**
 * Finds the index of a player given a list of player services and lowercased username.
 * Returns -1 if username doesn't exist
 */
export const indexOfPlayer = (entities: Entity[], username: string) => {
  const players = filterByComponent(entities, CPlayer.name);

  for (const [i, player] of players.entries()) {
    const comp = getComponent(player, CPlayer.name);
    if (
      (comp as CPlayer).displayUsername.toLowerCase() === username.toLowerCase()
    ) {
      return i;
    }
  }

  return -1;
};
